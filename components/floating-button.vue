<template>
  <div
    class="fixed bottom-0 left-0 right-0 z-10 flex justify-end w-full p-6 pointer-events-none select-none"
  >
    <div
      v-on="$listeners"
      class="text-green-500 bg-white rounded-full pointer-events-auto button-container"
    >
      <svg
        viewBox="0 0 16 16"
        class="w-12 h-12 -m-px bi bi-arrow-up-circle-fill"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-10.646.354a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 6.207V11a.5.5 0 0 1-1 0V6.207L5.354 8.354z"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.button-container {
  box-shadow: 0 0 5px black;

  &:active {
    box-shadow: none;
  }
}
</style>
