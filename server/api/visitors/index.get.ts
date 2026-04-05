import { prisma } from '../../../lib/prisma'

export default defineEventHandler(async () => {
  // Fetch all visitors
  const visitors = await prisma.visitors.findMany()
  return visitors
})
