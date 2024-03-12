# One-click PG Backups

## Developing

Start the dev server

```
bun run dev
```

Note: Backups do not happen in local dev. Created a `backups` folder at the root of this repository with a few files for testing the UI flows.

## TODOs

- [ ] Better frontend? It should be possible to render a true React app as the client
- [ ] If the above isn't possible, we should at least switch the `index.js` file to TS for type-safety and build+compile to JS in the Dockerfile
- [ ] Dockerfile cleanup
- [ ] Don't load Tailwind from the Play CDN but instead use the CLI + automate output.
- [ ] Make the UI nicer?
- [ ] Add support for _expiring_ backups after N days.
