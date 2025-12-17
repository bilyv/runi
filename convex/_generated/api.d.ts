/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as dashboard from "../dashboard.js";
import type * as expenseCategories from "../expenseCategories.js";
import type * as expenses from "../expenses.js";
import type * as folders from "../folders.js";
import type * as http from "../http.js";
import type * as productCategories from "../productCategories.js";
import type * as products from "../products.js";
import type * as router from "../router.js";
import type * as sales from "../sales.js";
import type * as settings from "../settings.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  dashboard: typeof dashboard;
  expenseCategories: typeof expenseCategories;
  expenses: typeof expenses;
  folders: typeof folders;
  http: typeof http;
  productCategories: typeof productCategories;
  products: typeof products;
  router: typeof router;
  sales: typeof sales;
  settings: typeof settings;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
