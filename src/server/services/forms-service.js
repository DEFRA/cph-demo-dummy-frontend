import path from 'path'
import { fileURLToPath } from 'node:url'
import { FileFormService } from '@defra/forms-engine-plugin/file-form-service.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const formsDir = path.join(dirname, '../forms')

const now = new Date()
const user = { id: 'local', displayName: 'Local Dev' }
const author = {
  createdAt: now,
  createdBy: user,
  updatedAt: now,
  updatedBy: user
}

const loader = new FileFormService()

await loader.addForm(path.join(formsDir, 'pet-registration.json'), {
  id: 'a1b2c3d4-0000-0000-0000-000000000001',
  title: 'Pet Registration Form',
  slug: 'pet-registration',
  organisation: 'Defra',
  teamName: 'Demo Team',
  teamEmail: 'demo@defra.gov.uk',
  submissionGuidance: "Thanks for registering your pet, we'll be in touch",
  notificationEmail: 'demo@defra.gov.uk',
  ...author,
  live: author
})

export const formsService = loader.toFormsService()