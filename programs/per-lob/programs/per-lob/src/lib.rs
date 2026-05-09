use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::{commit, delegate, ephemeral};
use ephemeral_rollups_sdk::cpi::DelegateConfig;

declare_id!("E9hPB1xqVDngvjoqWZnXPGhVwSeCBKyfzPBiot3CHoA6");

pub const ENGINE_AUTHORITY: Pubkey = pubkey!("MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo");

#[ephemeral]
#[program]
pub mod per_lob {
    use super::*;

    /// Initialize the (per-pair) book account on Solana L1.
    pub fn init_book(ctx: Context<InitBook>, base_mint: Pubkey, quote_mint: Pubkey) -> Result<()> {
        let book = &mut ctx.accounts.book;
        book.authority = ctx.accounts.authority.key();
        book.base_mint = base_mint;
        book.quote_mint = quote_mint;
        book.next_order_id = 1;
        book.bump = ctx.bumps.book;
        Ok(())
    }

    /// Delegate the book to the TEE validator → all subsequent state lives in the PER.
    pub fn delegate_book(ctx: Context<DelegateBook>) -> Result<()> {
        ctx.accounts.delegate_book(
            &ctx.accounts.payer,
            &[b"book", ctx.accounts.book.base_mint.as_ref(), ctx.accounts.book.quote_mint.as_ref()],
            DelegateConfig::default(),
        )?;
        Ok(())
    }

    /// Place a hidden order. Lives inside the TEE — only the engine + owner can read it.
    pub fn place_order(ctx: Context<PlaceOrder>, side: Side, price: u64, size: u64) -> Result<()> {
        require!(price > 0 && size > 0, LobError::InvalidOrder);
        let book = &mut ctx.accounts.book;
        let order = &mut ctx.accounts.order;
        order.id = book.next_order_id;
        order.owner = ctx.accounts.owner.key();
        order.side = side;
        order.price = price;
        order.size = size;
        order.filled = 0;
        order.status = OrderStatus::Open;
        order.ts = Clock::get()?.unix_timestamp;
        book.next_order_id = book.next_order_id.checked_add(1).unwrap();
        Ok(())
    }

    /// Owner-only cancel.
    pub fn cancel_order(ctx: Context<CancelOrder>) -> Result<()> {
        let order = &mut ctx.accounts.order;
        require_keys_eq!(order.owner, ctx.accounts.owner.key(), LobError::Unauthorized);
        require!(order.status == OrderStatus::Open, LobError::NotCancelable);
        order.status = OrderStatus::Cancelled;
        Ok(())
    }

    /// Match step: engine crosses two opposing orders. Authority gated to ENGINE_AUTHORITY.
    /// Real impl: walk book, price-time priority, partial fills, settle via Token program CPI.
    /// MVP: explicit pair-match (engine selects taker + maker off-chain, ix verifies + settles).
    pub fn match_tick(ctx: Context<MatchTick>, fill_price: u64, fill_size: u64) -> Result<()> {
        require_keys_eq!(ctx.accounts.engine.key(), ENGINE_AUTHORITY, LobError::Unauthorized);
        let buy = &mut ctx.accounts.buy_order;
        let sell = &mut ctx.accounts.sell_order;
        require!(buy.side == Side::Buy && sell.side == Side::Sell, LobError::SideMismatch);
        require!(buy.status == OrderStatus::Open && sell.status == OrderStatus::Open, LobError::NotMatchable);
        require!(buy.price >= fill_price && sell.price <= fill_price, LobError::CrossViolation);
        let buy_remaining = buy.size.saturating_sub(buy.filled);
        let sell_remaining = sell.size.saturating_sub(sell.filled);
        require!(fill_size <= buy_remaining && fill_size <= sell_remaining, LobError::OverFill);

        buy.filled += fill_size;
        sell.filled += fill_size;
        if buy.filled == buy.size { buy.status = OrderStatus::Filled; }
        if sell.filled == sell.size { sell.status = OrderStatus::Filled; }

        emit!(FillEvent {
            buy_order: buy.id,
            sell_order: sell.id,
            price: fill_price,
            size: fill_size,
            ts: Clock::get()?.unix_timestamp,
        });
        Ok(())
    }

    /// Commit current PER state back to Solana L1 (snapshot).
    pub fn commit_book(ctx: Context<CommitBook>) -> Result<()> {
        commit::commit_account(&ctx.accounts.payer, &ctx.accounts.book.to_account_info())?;
        Ok(())
    }

    /// Undelegate book — return ownership to L1.
    pub fn undelegate_book(ctx: Context<UndelegateBook>) -> Result<()> {
        commit::commit_and_undelegate_accounts(
            &ctx.accounts.payer,
            vec![&ctx.accounts.book.to_account_info()],
            &ctx.accounts.magic_context,
            &ctx.accounts.magic_program,
        )?;
        Ok(())
    }
}

// ──────────────────────────────────────────────────────────────────────────
// Accounts
// ──────────────────────────────────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(base_mint: Pubkey, quote_mint: Pubkey)]
pub struct InitBook<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Book::SIZE,
        seeds = [b"book", base_mint.as_ref(), quote_mint.as_ref()],
        bump
    )]
    pub book: Account<'info, Book>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[delegate]
#[derive(Accounts)]
pub struct DelegateBook<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: validated via PDA seeds in delegate macro
    #[account(mut, del)]
    pub book: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct PlaceOrder<'info> {
    #[account(mut)]
    pub book: Account<'info, Book>,
    #[account(
        init,
        payer = owner,
        space = 8 + Order::SIZE,
        seeds = [b"order", book.key().as_ref(), &book.next_order_id.to_le_bytes()],
        bump
    )]
    pub order: Account<'info, Order>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelOrder<'info> {
    #[account(mut, has_one = owner)]
    pub order: Account<'info, Order>,
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct MatchTick<'info> {
    #[account(mut)]
    pub buy_order: Account<'info, Order>,
    #[account(mut)]
    pub sell_order: Account<'info, Order>,
    pub engine: Signer<'info>,
}

#[derive(Accounts)]
pub struct CommitBook<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub book: Account<'info, Book>,
}

#[derive(Accounts)]
pub struct UndelegateBook<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub book: Account<'info, Book>,
    /// CHECK: magic context
    #[account(mut)]
    pub magic_context: AccountInfo<'info>,
    /// CHECK: magic program
    pub magic_program: AccountInfo<'info>,
}

// ──────────────────────────────────────────────────────────────────────────
// State
// ──────────────────────────────────────────────────────────────────────────

#[account]
pub struct Book {
    pub authority: Pubkey,
    pub base_mint: Pubkey,
    pub quote_mint: Pubkey,
    pub next_order_id: u64,
    pub bump: u8,
}
impl Book { pub const SIZE: usize = 32 + 32 + 32 + 8 + 1; }

#[account]
pub struct Order {
    pub id: u64,
    pub owner: Pubkey,
    pub side: Side,
    pub price: u64,
    pub size: u64,
    pub filled: u64,
    pub status: OrderStatus,
    pub ts: i64,
}
impl Order { pub const SIZE: usize = 8 + 32 + 1 + 8 + 8 + 8 + 1 + 8; }

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum Side { Buy, Sell }

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum OrderStatus { Open, Filled, Cancelled }

#[event]
pub struct FillEvent {
    pub buy_order: u64,
    pub sell_order: u64,
    pub price: u64,
    pub size: u64,
    pub ts: i64,
}

#[error_code]
pub enum LobError {
    #[msg("price and size must be > 0")] InvalidOrder,
    #[msg("only the order owner may modify it")] Unauthorized,
    #[msg("order is not in a cancelable state")] NotCancelable,
    #[msg("buy and sell sides do not match")] SideMismatch,
    #[msg("one or both orders are not open")] NotMatchable,
    #[msg("fill price violates order limits")] CrossViolation,
    #[msg("fill size exceeds remaining size")] OverFill,
}
