import Vue from 'vue'
import App from './App.vue'
import DateTimePicker from './components/DateTimePicker.vue'

Vue.component('date-picker', DateTimePicker);

new Vue(
{
  el: '#app',
  render: h => h(App)
})
