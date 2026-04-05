import { prisma } from '../../../lib/prisma'

export default defineEventHandler(async () => {
  const boothTypes = await prisma.boothTypes.findMany({
    include: {
      booths: true
    },
    orderBy: { size: 'asc' }
  })
  
  return boothTypes
})
