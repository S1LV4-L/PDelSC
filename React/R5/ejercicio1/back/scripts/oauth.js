const CONFIG = {
    google: {
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        userUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL,
        scope: "openid profile",
    },
    github: {
        authUrl: "https://github.com/login/oauth/authorize",
        tokenUrl: "https://github.com/login/oauth/access_token",
        userUrl: "https://api.github.com/user",
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackUrl: process.env.GITHUB_CALLBACK_URL,
        scope: "read:user",
    },
    jira: {
        authUrl: "https://auth.atlassian.com/authorize",
        tokenUrl: "https://auth.atlassian.com/oauth/token",
        userUrl: "https://api.atlassian.com/me",
        clientId: process.env.JIRA_CLIENT_ID,
        clientSecret: process.env.JIRA_CLIENT_SECRET,
        callbackUrl: process.env.JIRA_CALLBACK_URL,
        scope: "read:me",
    },
};

export function obtenerUrlAutorizacion(proveedor) {
    const config = CONFIG[proveedor];
    if (!config) throw new Error("Proveedor no soportado");

    const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.callbackUrl,
        scope: config.scope,
        response_type: "code",
        prompt: "consent",
    });
    if (proveedor === "jira") params.set("audience", "api.atlassian.com");

    return `${config.authUrl}?${params}`;
}

export async function obtenerDatosUsuario(proveedor, code) {
    const config = CONFIG[proveedor];
    if (!config) throw new Error("Proveedor no soportado");

    const accessToken = await intercambiarCode(proveedor, config, code);
    return obtenerPerfil(proveedor, config, accessToken);
}

async function intercambiarCode(proveedor, config, code) {
    if (proveedor === "facebook") {
        const params = new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            redirect_uri: config.callbackUrl,
            code,
        });
        const resp = await fetch(`${config.tokenUrl}?${params}`);
        const data = await resp.json();
        return data.access_token;
    }

    const resp = await fetch(config.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            redirect_uri: config.callbackUrl,
            code,
            grant_type: "authorization_code",
        }),
    });
    const data = await resp.json();
    return data.access_token;
}

async function obtenerPerfil(proveedor, config, accessToken) {
    const headers = proveedor === "github"
        ? { Authorization: `token ${accessToken}` }
        : { Authorization: `Bearer ${accessToken}` };

    const url = proveedor === "facebook"
        ? `${config.userUrl}?fields=id,name&access_token=${accessToken}`
        : config.userUrl;

    const resp = await fetch(url, { headers });
    const data = await resp.json();

    if (proveedor === "google") return { proveedorId: data.sub, nombre: data.name };
    if (proveedor === "github") return { proveedorId: String(data.id), nombre: data.login };
    if (proveedor === "jira") return { proveedorId: data.account_id, nombre: data.name };
    return { proveedorId: data.id, nombre: data.name };
}