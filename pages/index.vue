<template>
  <Sidebar>
    <div class="bg-gray-100 p-4 rounded-md shadow-md">
      <h1 class="text-2xl font-bold w-fit mb-4">Troca de Cartas</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div>
          <h2 class="text-xl font-semibold mb-2">Minha Coleção</h2>
          <CustomSelect v-model="selectedMyCardId" :items="myCardOptions" />
        </div>
        <div>
          <h2 class="text-xl font-semibold mb-2">Todas as Cartas</h2>
          <CustomSelect v-model="selectedCardId" :items="allCardOptions" />
        </div>
        <div class="flex items-end md:col-span-2 lg:col-span-1 mb-1">
          <button @click="confirmTrade" :disabled="!selectedMyCardId || !selectedCardId"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 w-full h-14">
            Solicitar Troca
          </button>
        </div>
      </div>
      <div class="mt-6">
        <h2 class="text-xl font-semibold mb-2">Solicitações de trocas</h2>
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table v-if="!loading" class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead class="text-xs uppercase bg-gray-50 dark:bg-gray-700 text-white">
              <tr>
                <th scope="col" class="px-6 py-3">
                  Usuário
                </th>
                <th scope="col" class="px-6 py-3">
                  Oferta
                </th>
                <th scope="col" class="px-6 py-3">
                  Demanda
                </th>
                <th scope="col" class="px-6 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="trade in trades" :key="trade.id" class="bg-gray-300 border-b hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {{ trade.user.name }}
                </td>
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  <div class="flex justify-between items-center">
                    {{ trade.tradeCards[0].card?.name }}
                    <img :src="trade.tradeCards[0].card.imageUrl" alt="Card Image" class="w-8 h-full max-xl:hidden">
                  </div>
                </td>
                <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  <div class="flex justify-between items-center">
                    <p>
                      {{ trade.tradeCards[1].card?.name }}
                    </p>
                    <img :src="trade.tradeCards[1].card?.imageUrl" alt="Card Image" class="w-8 h-full max-xl:hidden">
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button type="button" @click="deleteTrade(trade.id)" :disabled="trade.userId !== idUser"
                    class="group focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400">
                    Deletar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <Loading v-else />
        </div>
      </div>
    </div>
    
    <ToastSuccess v-if="showSuccessToast" :success-message="successMessage" @close="showSuccessToast = false"
      class="fixed bottom-5 right-5" />
    <ToastError v-if="showErrorToast" :error-message="errorMessage" @close="showErrorToast = false"
      class="fixed bottom-5 right-5" />
  </Sidebar>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Sidebar from '~/components/Sidebar.vue'
import Loading from '~/components/Loading.vue'
import ToastSuccess from '~/components/ToastSuccess.vue'
import ToastError from '~/components/ToastError.vue'
import CustomSelect from '@/components/CustomSelect.vue'
import { jwtDecode } from "jwt-decode";

const myCards = ref([])
const allCards = ref([])
const selectedMyCardId = ref('')
const selectedCardId = ref('')
const selectedMyCard = ref(null)
const selectedCard = ref(null)
const loading = ref(false)
const showSuccessToast = ref(false)
const showErrorToast = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const myCardOptions = ref([])
const allCardOptions = ref([])
const trades = ref([])
const idUser = ref('')


const fetchTrades = async () => {
  try {
    loading.value = true
    const response = await fetch(`https://cards-marketplace-api.onrender.com/trades?rpp=1000&page=1`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    trades.value = data.list
  } catch (error) {
    showError(error.message || 'Erro desconhecido')
  } finally {
    loading.value = false
  }
}

const fetchMyCards = async () => {
  try {
    loading.value = true
    const response = await fetch('https://cards-marketplace-api.onrender.com/me/cards', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    myCards.value = data.filter(card => card.imageUrl)
    myCardOptions.value = myCards.value.map(card => ({
      value: card.id,
      label: card.name,
      image: card.imageUrl
    }))
  } catch (error) {
    showError(error.message || 'Erro desconhecido')
  } finally {
    loading.value = false
  }
}

const fetchAllCards = async () => {
  try {
    loading.value = true
    const response = await fetch('https://cards-marketplace-api.onrender.com/cards?rpp=100&page=1', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    allCards.value = data.list.filter(card => card.imageUrl)
    allCardOptions.value = allCards.value.map(card => ({
      value: card.id,
      label: card.name,
      image: card.imageUrl
    }))
  } catch (error) {
    showError(error.message || 'Erro desconhecido')
  } finally {
    loading.value = false
  }
}

const deleteTrade = async (tradeId) => {
  try {
    loading.value = true
    const response = await fetch(`https://cards-marketplace-api.onrender.com/trades/${tradeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    trades.value = trades.value.filter(trade => trade.id !== tradeId)
    showSuccess('Troca deletada com sucesso!')
  } catch (error) {
    showError(error.message || 'Erro desconhecido')
  } finally {
    loading.value = false
  }
}

const getIdUser = () => {
  const token = localStorage.getItem("token")
  if (token) {
    const decodedToken = jwtDecode(token)
    idUser.value = decodedToken.id
  }
}

const updateMyCard = () => {
  selectedMyCard.value = myCards.value.find(card => card.id === selectedMyCardId.value)
}

const updateCard = () => {
  selectedCard.value = allCards.value.find(card => card.id === selectedCardId.value)
}

const confirmTrade = async () => {
  try {
    loading.value = true
    const response = await fetch('https://cards-marketplace-api.onrender.com/trades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        cards: [
          { cardId: selectedMyCardId.value, type: 'OFFERING' },
          { cardId: selectedCardId.value, type: 'RECEIVING' }
        ]
      })
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    fetchTrades()
    showSuccess('Troca solicitada com sucesso!')
  } catch (error) {
    showError(error.message || 'Erro desconhecido')
  } finally {
    loading.value = false
  }
}

watch(selectedMyCardId, updateMyCard)
watch(selectedCardId, updateCard)

onMounted(() => {
  fetchMyCards()
  fetchAllCards()
  fetchTrades()
  getIdUser()
})

const showError = (message) => {
  showErrorToast.value = true
  errorMessage.value = message
  setTimeout(() => {
    showErrorToast.value = false
  }, 5000)
}

const showSuccess = (message) => {
  showSuccessToast.value = true
  successMessage.value = message
  setTimeout(() => {
    showSuccessToast.value = false
  }, 3000)
}
</script>

<style>
  /* Estilos da página */
</style>
