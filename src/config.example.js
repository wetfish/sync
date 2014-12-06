module.exports =
{
    // Wetfish login
    login:
    {
        app_id: 'Wetfish Login App ID',
        app_secret: 'Wetfish Login App Secret'
    },

    // Redis sessions
    session:
    {
        secret: 'this should be secret'
    },

    // MySQL database
    mysql:
    {
        username: 'example',
        password: 'password',
        database: 'changeme'
    },

    // SSL config
    ssl_enabled: true,
    ssl_paths:
    {
        key: 'cert/key.pem',
        cert: 'cert/cert.pem'
    }
}
