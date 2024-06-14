<template>
  <div class="h-screen bg-blue-100 flex items-center justify-center p-4">
    <div v-if="!loading"
      class="max-w-sm mx-auto w-full bg-white shadow-md p-8 rounded-lg flex flex-col items-center justify-center gap-4">
      <h1 class="text-3xl text-blue-800 mb-4 font-semibold">Login</h1>
      <form @submit.prevent="handleLogin" class="w-full">
        <div class="mb-7 relative">
          <label for="email" class="block mb-2 text-sm font-medium text-gray-700">E-mail</label>
          <input type="email" id="email" v-model="email"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Digite seu email" required />
        </div>
        <div class="mb-8 relative">
          <label for="password" class="block mb-2 text-sm font-medium text-gray-700">Senha</label>
          <input type="password" id="password" v-model="password"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Digite sua senha" required />
        </div>
        <button type="submit"
          class="mt-1 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center">Entrar</button>
      </form>
      <nuxt-link class="mt-4 text-blue-800" :to="{ path: '/register' }">Registrar-se</nuxt-link>
    </div>
    <Loading v-else />
    <ToastError v-if="showErrorToast" :error-message="errorMessage" @close="showErrorToast = false" class="fixed bottom-5 right-5" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRuntimeConfig } from '#app'
import Loading from '~/components/Loading.vue'
import ToastError from '~/components/ToastError.vue'

const email = ref('')
const password = ref('')
const router = useRouter()
const config = useRuntimeConfig()
const API_URL = config.public.apiUrl
const loading = ref(false)
const showErrorToast = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!email.value || !password.value) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  try {
    loading.value = true
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    });

    if (!response.ok) {
      let errorMessage = 'Erro durante o login. Verifique suas credenciais.'
      if (response.status === 400) {
        errorMessage = 'Requisição inválida. Verifique os dados enviados.'
      } else if (response.status === 401) {
        errorMessage = 'Credenciais incorretas. Tente novamente.'
      } else if (response.status === 500) {
        errorMessage = 'Erro no servidor. Tente novamente mais tarde.'
      }
      throw new Error(errorMessage)
    }

    const data = await response.json();

    if (!data.token) {
      throw new Error('Token não recebido. Por favor, tente novamente.')
    }

    localStorage.setItem('token', data.token)

    router.push('/')
  } catch (error) {
    showErrorToast.value = true
    errorMessage.value = error.message
    setTimeout(() => {
      showErrorToast.value = false
    }, 5000)
  } finally {
    loading.value = false
  }
};
</script>
