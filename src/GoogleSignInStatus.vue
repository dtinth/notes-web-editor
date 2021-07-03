<template>
  <StatusItem
    @click="onClick"
    :clickable="!!current.clickAction"
    alignment="right"
    :title="current.title"
  >
    {{ current.text }}
  </StatusItem>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import StatusItem from './StatusItem.vue'
import {
  getGoogleLoginStatus,
  onCurrentUserChanged,
  signInWithGoogle,
} from './GoogleSignIn'

export default defineComponent({
  components: { StatusItem },
  setup() {
    const current = ref<{
      text: string
      title?: string
      clickAction?: () => void
    }>({
      text: 'Checking',
    })

    const unsubscribeFns: (() => void)[] = []
    onMounted(() => {
      async function refreshAuthStatus() {
        const loginStatus = await getGoogleLoginStatus()
        if (!loginStatus) {
          current.value = {
            text: 'Sign In',
            title: 'Sign in with Google',
            clickAction: signInWithGoogle,
          }
          return
        }
        current.value = {
          text: loginStatus.name,
          title: loginStatus.email,
          clickAction: () => {
            if (confirm('Do you want to sign out?')) {
              loginStatus.signOut()
            }
          },
        }
      }
      unsubscribeFns.push(onCurrentUserChanged(refreshAuthStatus))
      refreshAuthStatus()
    })
    onUnmounted(() => {
      unsubscribeFns.forEach((fn) => fn())
    })

    const onClick = () => {
      current.value.clickAction?.()
    }
    return { status, onClick, current }
  },
})
</script>
