<template>
  <main role="main">
    <section class="jumbotron text-center" background="bg1.jpg">
      <div class="container">
        <img
          src="~/assets/images/osuReportsLogoOptim.png"
          align="center"
          height="300"
          alt="osu Reports Logo"
        />
        <h3 class="mt-4">
          Get reports on your osu! sessions tweeted directly to you!
        </h3>
        <p class="my-4">
          {{ players }} users whitelisted!
          <br />
          {{ plays }} plays and {{ sessions }} sessions recorded!
        </p>
        <p>
          <a href="/twitter/login" class="btn btn-primary my-2">
            <strong>Login with twitter</strong>
          </a>
        </p>
      </div>
    </section>
  </main>
</template>

<script>
export default {
  data() {
    return {
      players: 0,
      plays: 0,
      sessions: 0
    };
  },
  async asyncData(context) {
    return context.app.$api.getStats();
  }
};
</script>
