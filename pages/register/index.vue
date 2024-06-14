<template>
  <div class="h-screen bg-blue-100 flex items-center justify-center p-4">
    <div v-if="!loading"
      class="max-w-sm mx-auto w-full bg-white shadow-md p-8 rounded-lg flex flex-col items-center justify-center gap-4">
      <img src="../../assets/logo-inmeta.svg" class="w-36" alt="INMETA Logo" />
      <form @submit.prevent="handleSubmit" class="w-full">
        <div class="mb-7 relative">
          <label for="name" class="block mb-2 text-sm font-medium text-gray-700">Nome</label>
          <input type="text" id="name" v-model="name" @blur="validateName"
            :class="{ 'border-red-500': nameTouched && nameError }"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Digite seu nome" required />
          <div v-if="nameTouched && nameError" class="text-red-500 text-sm absolute -bottom-5">{{ nameError }}</div>
        </div>
        <div class="mb-7 relative">
          <label for="email" class="block mb-2 text-sm font-medium text-gray-700">E-mail</label>
          <input type="email" id="email" v-model="email" @blur="validateEmail"
            :class="{ 'border-red-500': emailTouched && emailError }"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="name@email.com" required />
          <div v-if="emailTouched && emailError" class="text-red-500 text-sm absolute -bottom-5">{{ emailError }}</div>
        </div>
        <div class="mb-12 relative">
          <label for="password" class="block mb-2 text-sm font-medium text-gray-700">Senha</label>
          <input type="password" id="password" v-model="password" @blur="validatePassword"
            :class="{ 'border-red-500': passwordTouched && passwordError }"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Digite sua senha" required />
          <div v-if="passwordTouched && passwordError" class="text-red-500 text-sm absolute -bottom-10">{{ passwordError
            }}</div>
        </div>
        <button type="submit"
          class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center">Registrar</button>
      </form>
      <div class="flex items-center justify-center gap-1 mt-1">
        <p>Já tem conta?</p>
        <nuxt-link class="text-blue-800" :to="{ path: '/login' }">Clique aqui</nuxt-link>
      </div>
    </div>
    <Loading v-else />
    <ToastSuccess v-if="showSuccessToast" :success-message="successMessage" @close="showSuccessToast = false" class="fixed bottom-5 right-5" />
    <ToastError v-if="showErrorToast" :error-message="errorMessage" @close="showErrorToast = false" class="fixed bottom-5 right-5" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRuntimeConfig } from '#app'
import Loading from '~/components/Loading.vue'
import ToastSuccess from '~/components/ToastSuccess.vue'
import ToastError from '~/components/ToastError.vue'

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const showSuccessToast = ref(false)
const showErrorToast = ref(false)
const errorMessage = ref('')

const nameTouched = ref(false)
const emailTouched = ref(false)
const passwordTouched = ref(false)
const successMessage = ref('')

const validateEmail = () => {
  emailTouched.value = true
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return re.test(email.value)
}

const nameError = computed(() => {
  return name.value.length >= 4 ? '' : 'O nome deve ter no mínimo 4 caracteres.'
})

const emailError = computed(() => {
  return validateEmail() ? '' : 'Formato de email inválido.'
})

const validatePassword = () => {
  passwordTouched.value = true
  const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
  return re.test(password.value)
}

const passwordError = computed(() => {
  return validatePassword() ? '' : 'A senha deve conter letras, números e caractere especial.'
})

const validateName = () => {
  nameTouched.value = true
}

const config = useRuntimeConfig()
const API_URL = config.public.apiUrl

const handleSubmit = async () => {
  validateName()
  validateEmail()
  validatePassword()

  if (nameError.value || emailError.value || passwordError.value) {
    return
  }

  try {
    loading.value = true
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value
      })
    })

    if (!response.ok) {
      const responseData = await response.json()
      const error = new Error(responseData.message || 'Erro durante o registro')
      error.status = response.status
      throw error
    }

    const data = await response.json()

    showSuccessToast.value = true
    successMessage.value = 'Usuário cadastrado!'
    setTimeout(() => {
      showSuccessToast.value = false
      name.value = ''
      email.value = ''
      password.value = ''
      router.push('/')
      }, 3000)

  } catch (error) {
    showErrorToast.value = true
    errorMessage.value = error.message || 'Erro desconhecido'
    setTimeout(() => {
      showErrorToast.value = false
    }, 5000)
  } finally {
    loading.value = false
  }
}
</script>
