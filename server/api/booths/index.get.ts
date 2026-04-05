import { prisma } from '../../../lib/prisma'

export default defineEventHandler(async () => {
  const booths = await prisma.booths.findMany({
    include: {
      boothType: true,
      exhibitors: true
    },
    orderBy: { number: 'asc' }
  })
  
  return booths
})
