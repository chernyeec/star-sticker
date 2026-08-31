# Star Sticker

A mobile-friendly website for a single family where parents award or deduct star stickers as rewards or consequences, and kids track and redeem their own stars.

## Language

**Kid**:
A child in the family who has their own star balance, tracked separately from siblings, and their own way to access the app.
_Avoid_: Child (use in casual prose only), user (too generic)

**Star Ledger Entry**:
A single recorded adjustment to a Kid's star balance — a positive amount (reward) or negative amount (punishment) plus an optional reason. The Kid's current balance is the sum of their entries. Append-only: mistakes are corrected with a new offsetting entry, never by editing or deleting a past one. Forms the visible history log, visible in full to the Kid it belongs to.
_Avoid_: Transaction, log entry (too generic on its own)

**Star Balance**:
A Kid's current star total, derived from summing their Star Ledger Entries. Can go negative if punishments outweigh rewards — there is no floor at zero.
_Avoid_: Star count, points, score

**Family**:
The household a Parent and their Kids belong to. Modeled as an explicit entity even though this deployment only ever has one, so a second household could be added later without a redesign.

**Parent**:
An adult in the Family who can create Star Ledger Entries for any Kid in the Family, manage the Reward catalog, and approve Redemptions. A Family can have more than one Parent, each with their own login.

**Reward**:
A catalog item with a star cost, redeemable by a Kid once their Star Balance is high enough. Shared across the whole Family — not specific to one Kid.
_Avoid_: Prize (use Reward consistently)

**Redemption**:
A Kid's request to exchange stars for a Reward. Starts Pending; a Parent Approves it (deducting the Reward's cost from the Kid's Star Balance via a Star Ledger Entry) or Rejects it (with an optional reason, staying visible in history); the requesting Kid can also Cancel it themselves while still Pending. Snapshots the Reward's name and cost at request time, so a later edit or removal of the Reward doesn't change past Redemption records.
_Avoid_: Purchase, claim
