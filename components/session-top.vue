<template>
  <div class="session">
    <div class="session-container">
      <div class="layer">
        <div class="image-container" :style="style"></div>
      </div>
      <div class="row text-content">
        <table>
          <tr>
            <td class="blue-text">Global Rank:</td>
            <td>
              #{{parseFloat(globalRank).toLocaleString("en")}}
              <span
                v-if="difGlobalRank.includes('+')"
                class="green-text"
              >{{difGlobalRank}}</span>
              <span v-if="difGlobalRank.includes('-')" class="red-text">{{difGlobalRank}}</span>
            </td>
          </tr>
          <tr>
            <td class="blue-text">Country Rank:</td>
            <td>
              #{{parseFloat(countryRank).toLocaleString("en")}}
              <span
                v-if="difCountryRank.includes('+')"
                class="green-text"
              >{{difCountryRank}}</span>
              <span v-if="difCountryRank.includes('-')" class="red-text">{{difCountryRank}}</span>
            </td>
          </tr>
          <tr>
            <td class="blue-text">Accuracy:</td>
            <td>
              {{accuracy}}%
              <span v-if="difAcc.includes('+')" class="green-text">{{difAcc}}</span>
              <span v-if="difAcc.includes('-')" class="red-text">{{difAcc}}</span>
            </td>
          </tr>
          <tr>
            <td class="blue-text">PP:</td>
            <td>
              {{parseFloat(totalPP).toLocaleString("en")}}
              <span
                v-if="difPP.includes('+')"
                class="green-text"
              >{{difPP}}</span>
              <span v-if="difPP.includes('-')" class="red-text">{{difPP}}</span>
            </td>
          </tr>
          <tr>
            <td class="blue-text">Play Count:</td>
            <td>
              {{parseFloat(playCount).toLocaleString("en")}}
              <span
                v-if="difPlayCount.includes('+')"
                class="green-text"
              >{{difPlayCount}}</span>
              <span v-if="difPlayCount.includes('-')" class="red-text">{{difPlayCount}}</span>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
// @ts-ignore
import image from "~/assets/images/spectrumTriangles.jpg";

export default {
  data: function () {
    return {
      image: image,
    };
  },
  props: {
    sessionID: Number,
    tweetID: String,
    date: String,
    osuUsername: String,
    sessionDuration: String,
    globalRank: Number,
    difGlobalRank: String,
    countryRank: Number,
    difCountryRank: String,
    level: Number,
    difLevel: String,
    accuracy: Number,
    difAcc: String,
    totalPP: Number,
    difPP: String,
    playCount: Number,
    difPlayCount: String,
    countSSPlus: Number,
    countSS: Number,
    countSPlus: Number,
    countS: Number,
    countA: Number,
  },
  computed: {
    /** @returns {{backgroundImage: string}} */
    style() {
      return {
        backgroundImage: `url("${image}")`,
      };
    },
    dateFormat() {
      let date = new Date(this.date);
      let year = date.getFullYear();
      let month = (1 + date.getMonth()).toString();
      // month = month.length > 1 ? month : "0" + month;
      let day = date.getDate().toString();
      // day = day.length > 1 ? day : "0" + day;
      return month + "/" + day + "/" + year;
    },
  },
};
</script>


<style>
@import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@700&display=swap");
</style>

<style lang="scss" scoped>
@mixin blue-text {
  background: -webkit-linear-gradient(rgb(112, 212, 255), rgb(0, 191, 255));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.blue-text {
  @include blue-text();
}

@mixin white-text {
  background: -webkit-linear-gradient(rgb(255, 255, 255), rgb(149, 149, 149));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.white-text {
  @include white-text();
}

@mixin gold-text {
  background: -webkit-linear-gradient(rgb(255, 217, 0), rgb(175, 134, 0));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gold-text {
  @include gold-text();
}

@mixin green-text {
  background: -webkit-linear-gradient(rgb(0, 255, 0), rgb(3, 136, 3));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.green-text {
  @include green-text();
}

@mixin red-text {
  background: -webkit-linear-gradient(rgb(255, 0, 0), #990000);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.red-text {
  @include red-text();
}

.session {
  font-family: "Ubuntu", sans-serif;
  /* width and color */
  -webkit-text-stroke: 0.5px black;
  height: auto;
  /* min-width: 30rem; */
  line-height: 1.25;

  padding: 0.5em;
  min-height: 4em;
}

.session-container {
  width: 100%;
  height: 100%;
  background: linear-gradient(#bbb, #000);
  position: relative;
  border-radius: 0.5em;
}

.layer {
  position: absolute;
  padding: 0.2em;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.image-container {
  padding: 0.2em;
  height: 100%;
  border-radius: calc(0.5em * 0.75);
  // filter: brightness(50%);
  /* do whatever you want to the background here */
  background: #eee;
  background-size: cover;
  background-repeat: no-repeat;
}

.text-content {
  margin: 0;
  width: 100%;
  height: 100%;
  padding: 0.5em;

  &,
  & * {
    z-index: 1;
  }
}

.right {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

th {
  @include blue-text();
}

td {
  @include white-text();
}
</style>
