import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.deleteMany()
  await prisma.post.deleteMany()
  await prisma.comment.deleteMany()

  const JohnDoe = await prisma.user.create({
    data: {
      username: 'John Doe',
      password: 'password',
    },
  })

  const JaneDoe = await prisma.user.create({
    data: {
      username: 'Jane Doe',
      password: 'password',
    },
  })

  await prisma.post.create({
    data: {
      title: 'This is a post about the @required-directive',
      content: 'It can be very handy',
      posterId: JohnDoe.id,
      comments: {
        create: [
          {
            commenterId: JaneDoe.id,
            content: 'Agreed, but be careful about using them in callbacks!',
          },
        ],
      },
    },
  })

  await prisma.post.create({
    data: {
      title: 'This is a post about relay connections',
      content: "They're great",
      posterId: JaneDoe.id,
      comments: {
        create: [
          {
            commenterId: JohnDoe.id,
            content: 'They require a bit of set-up, but you get so much for free',
          },
        ],
      },
    },
  })
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
