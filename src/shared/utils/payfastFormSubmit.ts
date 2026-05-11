/**
 * Submits a PayFast-hosted checkout form (browser POST with hidden fields).
 * Must be called from a user gesture when possible (some browsers restrict popups).
 */
export function submitPayfastForm(actionUrl: string, method: string, fields: Record<string, string>, target = '_blank') {
  const form = document.createElement('form')
  form.method = method.toUpperCase() === 'GET' ? 'get' : 'post'
  form.action = actionUrl
  form.target = target
  form.style.display = 'none'

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  }

  document.body.appendChild(form)
  form.submit()
  form.remove()
}
