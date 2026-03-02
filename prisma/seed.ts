import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local', override: true })

import { PrismaClient, ComponentStatus } from '../src/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const SEED_WORKSPACE_ID = 'seed-workspace-001'

const COMPONENT_NAMES = [
  'button',
  'input',
  'textarea',
  'checkbox',
  'switch',
  'slider',
  'badge',
  'progress',
  'skeleton',
]

async function main() {
  const workspace = await prisma.workspace.upsert({
    where: { id: SEED_WORKSPACE_ID },
    update: {},
    create: {
      id: SEED_WORKSPACE_ID,
      name: 'My Workspace',
    },
  })

  console.log(`Workspace: ${workspace.name} (${workspace.id})`)

  for (const componentName of COMPONENT_NAMES) {
    const config = await prisma.componentConfig.upsert({
      where: {
        workspaceId_componentName: {
          workspaceId: SEED_WORKSPACE_ID,
          componentName,
        },
      },
      update: {},
      create: {
        workspaceId: SEED_WORKSPACE_ID,
        componentName,
        props: {},
        githubFilePath: null,
        status: ComponentStatus.PENDING_ADD,
      },
    })

    console.log(`  ComponentConfig: ${config.componentName} (${config.status})`)
  }

  console.log(`\nSeeded ${COMPONENT_NAMES.length} ComponentConfig rows.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
