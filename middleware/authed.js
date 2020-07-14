export default function(ctx) {
  if (!ctx.store.state.player) {
    return ctx.redirect(302, "/");
  }
}
