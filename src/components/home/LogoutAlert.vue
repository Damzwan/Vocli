<template>
  <ion-alert
      trigger="logout"
      header="Confirm Logout"
      message="Are you sure you want to logout?"
      :buttons="[
      { text: 'Cancel', role: 'cancel' },
      { text: 'Logout', handler: logout }
    ]"
  />
</template>

<script setup lang="ts">
import {useAuthStore} from "@/states/auth.state";
import {alertController} from "@ionic/vue";

const authStore = useAuthStore();

function logout() {
  authStore.logout();
  alertController.dismiss();
}
</script>
