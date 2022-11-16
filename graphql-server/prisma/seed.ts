import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.upsert({
    where: { username: 'abc' },

    update: {},
    create: {
      username: 'abc',
      password: 'abc',

      Counter: {
        create: {
          label: 'ABCs counter',
          value: 0,
        },
      },
    },
  })

  const defaultCounter = await prisma.counter.findFirst({ where: { owner: null } })

  if (!defaultCounter) {
    await prisma.counter.create({
      data: {
        label: 'Default Counter',
        value: 0,
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async e => {
    console.error(e)

    await prisma.$disconnect()
    process.exit(1)
  })
