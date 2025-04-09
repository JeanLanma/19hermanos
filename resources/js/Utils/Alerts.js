import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-right',
  iconColor: 'white',
  customClass: {
    popup: 'colored-toast',
  },
  showConfirmButton: false,
  timer: 1500,
  timerProgressBar: true,
})

// Toast.fire({
//     icon: 'success',
//     title: 'Success',
// })
// Toast.fire({
//     icon: 'error',
//     title: 'Error',
// })
// Toast.fire({
//     icon: 'warning',
//     title: 'Warning',
// })
// Toast.fire({
//     icon: 'info',
//     title: 'Info',
// })
// Toast.fire({
//     icon: 'question',
//     title: 'Question',
// })

/**
 * make a function like
 * Toast.success('Success')
 * Toast.error('Error')
 * Toast.warning('Warning')
 * Toast.info('Info')
 * Toast.question('Question')
 * Toast.custom('Custom', 'success')
 */
const makeToast = (icon) => {
    return (title, timer = 5000) => {
        Toast.fire({
            icon: icon,
            title: title,
            timer: timer,
        })
    }
}
Toast.success = makeToast('success')
Toast.error = makeToast('error')
Toast.warning = makeToast('warning')
Toast.info = makeToast('info')
Toast.question = makeToast('question')
Toast.custom = (title, icon, timer = 5000) => {
    Toast.fire({
        icon: icon,
        title: title,
        timer: timer,
    })
}

export { Toast }