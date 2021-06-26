declare namespace NodeJS {
    interface Global {
        prisma: PrismaClient<
        PrismaClientOptions, never,
        RejectOnNotFound |
        RejectPerOperation |
        undefined>;
    }
}
