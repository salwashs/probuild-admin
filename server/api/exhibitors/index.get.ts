import { prisma } from '../../../lib/prisma'

export default defineEventHandler(async () => {
  const exhibitors = await prisma.exhibitors.findMany({
    include: {
      boothType: true,
      booth: true
    }
  })
  
  return exhibitors
})
