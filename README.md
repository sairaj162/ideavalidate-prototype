# Build Bloom Framework

build it

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://build-bloom-framework.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c44f9a30-481a-4dd3-bedd-ad93055866b9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Deploy to Netlify

This app uses Nitro's Netlify preset for server-rendered routes. To deploy:

1. Push the project to a Git provider and import the repository into Netlify, or use the Netlify CLI.
2. Keep the build command as `npm run build` and the publish directory as `dist` (these are set in `netlify.toml`).
3. Deploy the site. Netlify builds the server function and static assets from the same command.

For a CLI deployment, authenticate with `netlify login`, link the site with `netlify link`, then run `netlify deploy --build --prod`.
