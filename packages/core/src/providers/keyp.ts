/**
 * <h1 align="center"><img width="600" style="border-radius: 30px;" src="https://raw.githubusercontent.com/UseKeyp/.github/main/Keyp-Logo-Color.svg"/></h1>
 */
import type { OIDCConfig, OIDCUserConfig } from "./index.js"

export interface KeypProfile extends Record<string, any> {
  sub: string
  username: string
  address: string
  email: string
  imageSrc: string
}

// Any config required that isn't part of the `OAuthUserConfig` spec should belong here
// For example, we must pass a `redirectUrl` to Keyp's API when requesting tokens, therefore we add it here
// The redirect URL must be added to a Keyp client in the [Keyp Developer Portal](https://dev.usekeyp.com)
interface AdditionalConfig {
  redirectUrl: string | undefined
  scope: string | undefined
}

/**
 * Add Keyp login to your page.
 *
 * ### Setup
 * Make sure to get a client ID from [Keyp's Developer Portal](https://dev.usekeyp.com)
 *
 * #### Callback URL (set this in Keyp's Developer Portal for your client and in your app .env)
 * ```
 * https://example.com/api/auth/callback/keyp
 * ```
 *
 * #### Configuration
 *```js
 * import Auth from "@auth/core"
 * import Keyp from "@auth/core/providers/keyp"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [Keyp({ clientId: KEYP_CLIENT_ID, redirectUrl: KEYP_CLIENT_REDIRECT_URI })],
 * })
 * ```
 *
 * ### Resources
 *
 *  - [Keyp OAuth documentation](https://docs.usekeyp.com/applications/oauth)
 *
 * ### Notes
 *
 * By default, Auth.js assumes that the Keyp provider is
 * based on the [OAuth 2](https://www.rfc-editor.org/rfc/rfc6749.html) specification.
 *
 * :::tip
 *
 * The Keyp provider comes with a [default configuration](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/keyp.ts).
 * To override the defaults for your use case, check out [customizing a built-in OAuth provider](https://authjs.dev/guides/providers/custom-provider#override-default-options).
 *
 * :::
 *
 * :::tip
 * If using JWT for the session, you can add additional properties to the JWT and session. Example:
 * ```js
 * options: {
 *   callbacks: {
 *      async jwt({ token, account, profile }: { token: Token; account: Account; profile: Profile }) {
 *          if (account) {
 *              // Comes from the returned JWT from Keyp
 *              token.accessToken = account.access_token;
 *          }
 *          if (profile) {
                // Comes from the /userinfo endpoint
 *              token.username = profile.username;
 *              token.address = profile.address;
 *              token.sub = profile.sub;
 *          }
 *          return token;
 *      },
 *      async session({ session, token }: { session: Session; token: Token }) {
 *          // Send properties to the client, like an access_token from a provider.
 *          if (token) {
 *              session.user.accessToken = token.accessToken;
 *              session.user.username = token.username;
 *              session.user.address = token.address;
 *              session.user.id = token.sub;
 *          }
 *          return session;
 *      },
 *  },
 * ```
 * :::
 *
 * :::info **Disclaimer**
 *
 * If you think you found a bug in the default configuration, you can [open an issue](https://authjs.dev/new/provider-issue).
 *
 * Auth.js strictly adheres to the specification and it cannot take responsibility for any deviation from
 * the spec by the provider. You can open an issue, but if the problem is non-compliance with the spec,
 * we might not pursue a resolution. You can ask for more help in [Discussions](https://authjs.dev/new/github-discussions).
 *
 * :::
 */
export default function Keyp<P extends KeypProfile>(
  config: OIDCUserConfig<P> & AdditionalConfig
): OIDCConfig<P> {
  const { clientId, scope } = config
  const defaultScope = "openid email"

  // Keyp's API domain is configurable for local testing, but defaults to https://api.usekeyp.com
  const KEYP_API_DOMAIN =
    process.env.NEXT_PUBLIC_KEYP_API_DOMAIN || "https://api.usekeyp.com"

  return {
    id: "keyp",
    name: "Keyp",
    type: "oidc",
    clientId,
    issuer: "https://api.usekeyp.com",
    wellKnown: `${KEYP_API_DOMAIN}/oauth/.well-known/openid-configuration`,
    authorization: {
      url: "https://app.usekeyp.com/oauth/auth",
      params: { scope: scope ? scope : defaultScope },
    },
    token: { url: "https://api.usekeyp.com/oauth/token" },
    userinfo: `https://api.usekeyp.com/oauth/me`,
    client: { token_endpoint_auth_method: "none" },
    profile(profile: P) {
      return {
        id: profile.sub,
        name: profile.username,
        email: profile.email,
        image: profile.imageSrc,
        address: profile.address,
      }
    },
    style: {
      logo: "/keyp.svg",
      logoDark: "/keyp-dark.svg",
      bg: "#fff",
      text: "#005285",
      bgDark: "#005285",
      textDark: "#fff",
    },
    options: config,
  }
}
