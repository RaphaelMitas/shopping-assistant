import { type GenericCtx } from "@convex-dev/better-auth";
import { components } from "./_generated/api";
import { Autumn } from "@useautumn/convex";
import { type DataModel } from "./_generated/dataModel";

export const autumn = new Autumn(components.autumn, {
  secretKey: process.env.AUTUMN_SECRET_KEY ?? "",
  identify: async (ctx: GenericCtx<DataModel>) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) return null;

    const userId = user.subject.split("|")[0];
    return {
      customerId: userId,
      customerData: {
        name: user.name,
        email: user.email,
      },
    };
  },
});

export const {
  track,
  cancel,
  query,
  attach,
  check,
  checkout,
  usage,
  setupPayment,
  createCustomer,
  listProducts,
  billingPortal,
  createReferralCode,
  redeemReferralCode,
  createEntity,
  getEntity,
} = autumn.api();
