# Dog Kingdom

### Environment requirement
- Nodejs v22.14.0 or higher
- Visual studio code
- Mongodb 5.0.5
- Redis

### Run steps
```
# Prepare .env file
cp .env.template .env.development
Fill env value to .env.development 

# Install node packages
npm install

# Start dev server
npm run dev
```

### Setup data config
# Set an admin account
- Register an admin account: /api/v1/users/register
- Goto database and change role to 'admin'
# Setup data
- Login admin account to get access token
- Run setup game config: /api/v1/config/setup-game-config

===================

# jwt decode

user_jwt
{
    user_id: '61baab96b15e159e64841400',
    email: 'zgezt91@gmail.com',
    iat: 1639640243,
    exp: 1639726643
}