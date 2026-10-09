# ShopKart assignment review

The final submission is the connected Labs 03–06 app. The original code covered the main shopping journey, but several behaviors and setup assumptions prevented a complete, reliable demonstration.

## Findings and implemented changes

| Original finding                                          | Impact                                                          | Resolution                                                                                                      |
| --------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Checkout required Razorpay keys for any completed order   | A reviewer without credentials could not finish the journey     | Added a clearly labeled COD flow with actual MongoDB persistence; retained Razorpay Test Mode                   |
| Successful payment did not reduce inventory               | Products could be bought repeatedly beyond stock                | Order placement, stock reduction and purchased cart consumption now run in a MongoDB transaction                |
| Cart was entirely cleared after payment                   | Items added while payment was open were lost                    | Only quantities in the order snapshot are consumed; later additions remain                                      |
| Public POST `/products` accepted arbitrary catalog writes | Anyone could alter the storefront                               | Removed public catalog creation; seed script manages products                                                   |
| Saved hearts were disabled                                | Removing a saved product required another page                  | Shared wishlist state with working add/remove hearts and notifications                                          |
| Email/phone/type validation was incomplete                | Malformed requests could create poor data or produce 500 errors | Normalize email, validate field types/lengths, validate Indian mobile numbers, return duplicate-email conflicts |
| Cookie settings were hardcoded for development            | HTTPS deployment lacked Secure session cookies                  | Production cookies are Secure; login/logout share matching attributes                                           |
| Product filters were lost on navigation                   | Difficult to resume or share a search                           | Search, category, sort and stock state are encoded in query parameters                                          |
| No price/name sorting or availability filter              | Limited discovery controls                                      | Added sorting and stock-only toggle with reset and empty states                                                 |
| Signup success state was unused                           | Users had no clear registration confirmation                    | Added account-created feedback, autocomplete and password visibility                                            |
| Home/catalog required login                               | Visitors could not explore before committing                    | Public home/catalog/details; customer data remains protected                                                    |
| Image failures left broken content                        | Remote catalog photos could spoil the interface                 | Shared local image fallback; bundled home and collection images                                                 |
| Only a narrow API test existed                            | Concurrency and real browser behavior were unverified           | Expanded integration coverage and added full browser journeys                                                   |
| Setup required manual MongoDB installation                | Harder for a reviewer to run                                    | Root runner starts persistent local MongoDB on its own port, seeds and launches API/UI                          |
| Seed reset stock every run                                | Restarting erased inventory changes                             | Insert-only seeding preserves existing stock and user data                                                      |
| Dependency audit found known vulnerabilities              | Unnecessary vulnerable dependencies remained                    | Updated router/source-map packages; removed nodemon and adopted Node watch                                      |
| Screenshots and README described the older UI             | Submission documentation did not match the app                  | Rewrote setup, features, routes, payment boundaries and screenshots                                             |

## Verification and boundaries

The API suite runs against an isolated replica set, with Razorpay Orders mocked. It checks signatures, idempotence, stock, totals, invalid inputs, ownership and two concurrent COD purchases. Browser tests use the running application and real database, creating a unique customer and COD order. Screenshots are from the browser, not design mockups.

A MongoDB replica set is required for transactional checkout. The local runner uses a real MongoDB binary with WiredTiger data files in ignored `.local-data/`; it is a development convenience rather than production hosting.

Razorpay remains a test integration. Production payments, refunds, webhook reconciliation, admin/fulfillment tools, password recovery and real delivery booking are outside the implemented assignment. The timeline renders saved order state; it does not simulate shipping progress. COD confirms placement and keeps payment pending until delivery.

Inventory is checked when a payment order is created and consumed when its signature is verified. It is not reserved while a Razorpay window is open. If another purchase consumes stock first, verification returns a stock conflict without partially updating inventory. A production store would need inventory reservations and payment reconciliation/refund handling for that case. No real-money payment mode is enabled.

No live deployment or live Razorpay transaction is claimed. The root README provides the exact setup and test commands, and the repository contains no intended credentials or environment files.
