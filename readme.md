# escher-bot

## Dev

First your [key, token and secrets from twitter](https://dev.twitter.com/apps). Then copy `.env.sample` to `.env` and replace it with your secrets.

```
$ yarn
$ yarn start
```

## Deploy

> If you have an instance running, before deploying stop it or remove it `yarn now-rm`

```
$ now secret add escher_consumer_key YOUR_KEY
$ now secret add escher_consumer_secret YOUR_SECRET
$ now secret add escher_access_token YOUR_TOKEN
$ now secret add escher_access_token_secret YOUR_SECRET

$ yarn deploy
```
