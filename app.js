const { App, ExpressReceiver } = require('@slack/bolt');
const { default: axios } = require('axios');
require('dotenv').config();

const AWS_API_URL = process.env.AWS_API_ROOT;

const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    stateSecret: 'my-state-secret',
    scopes: ['chat:write', 'commands'],
    installationStore: {
        storeInstallation: async (installation) => {
            // Installation ID is the {installation.team.id}
            const installationId = installation.team.id;

            installation.installationId = installationId;

            return await axios.post(`${AWS_API_URL}/v1`, installation, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.AWS_API_KEY
                }
            });
        },
        fetchInstallation: async (InstallQuery) => {
            const token = async (teamId) => {
                return await axios.get(`${AWS_API_URL}/v1?installationId=${teamId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': process.env.AWS_API_KEY
                    }
                })
            };

            const payload = await token(InstallQuery.teamId)
                .then((response) => {
                    return response.data;
                }).catch((e) => {
                    throw e;
                });
            
            return payload;
        },
        storeOrgInstallation: async (installation) => {
            // Installation ID is the {installation.enterprise.id}
            const installationId = installation.enterprise.id;

            installation.installationId = installationId;

            return await axios.post(`${AWS_API_URL}/v1`, installation, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.AWS_API_KEY
                }
            });
        },
        fetchOrgInstallation: async (InstallQuery) => {
            const token = async (enterpriseId) => {
                return await axios.get(`${AWS_API_URL}/v1?installationId=${enterpriseId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': process.env.AWS_API_KEY
                    }
                })
            };

            const payload = await token(InstallQuery.enterpriseId)
                .then((response) => {
                    return response.data;
                }).catch((e) => {
                    throw e;
                });
            
            return payload;
        },
    },
});

const app = new App({
    receiver: receiver,
});

app.event('app_home_opened', async ({ event, client, say }) => {
    await say('👋 App Home opened');
});

(async () => {
    await app.start(process.env.PORT || 3000);

    console.log('⚡️ Bolt app is running!');
})();