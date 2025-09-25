import { type GenericCtx } from "@convex-dev/better-auth";
import { components } from "./_generated/api";
import { Autumn } from "@useautumn/convex";
import { type DataModel } from "./_generated/dataModel";
import { authComponent } from "./auth";

export const autumn = new Autumn(components.autumn, {
  secretKey: process.env.AUTUMN_SECRET_KEY ?? "",
  identify: async (ctx: GenericCtx<DataModel>) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;

    const userId = user._id;
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
