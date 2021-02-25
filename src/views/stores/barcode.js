import Vue from 'vue'
import VueBarcodeScanner from 'vue-barcode-scanner'
let options = {
  sound: true, // default is false
  soundSrc: '/static/sound.wav', // default is blank
  sensitivity: 300, // default is 100
  requiredAttr: true, // default is false
  controlSequenceKeys: ['NumLock', 'Clear'], // default is null
  callbackAfterTimeout: true // default is false
}
Vue.use(VueBarcodeScanner, options)
export default {
    created () {
      // Add barcode scan listener and pass the callback function
    debugger
      this.$barcodeScanner.init(this.onBarcodeScanned)
    },
    destroyed () {
      // Remove listener when component is destroyed
      this.$barcodeScanner.destroy()
    },
    methods: {
      // Create callback function to receive barcode when the scanner is already done
      onBarcodeScanned (barcode) {
        console.log(barcode)
        // do something...
      },
      // Reset to the last barcode before hitting enter (whatever anything in the input box)
      resetBarcode () {
        let barcode = this.$barcodeScanner.getPreviousCode()
        // do something...
      }
    }
}