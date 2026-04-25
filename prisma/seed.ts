import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

const boothTypeData = [
  {
    id: "5482c819-93d6-49a8-91f5-f9561d5f1d94",
    name: "Gold",
    size: 36,
    price: 35000000,
  },
  {
    id: "6c5d06fb-1bfc-42f5-8f4f-164be24ae795",
    name: "Premium",
    size: 18,
    price: 15000000,
  },
  {
    id: "b475838d-ecdf-4b87-9fc3-7c2507c32353",
    name: "Silver",
    size: 18,
    price: 18000000,
  },
  {
    id: "ba5c74d8-3c97-406a-8cbe-2ce0c6718dc5",
    name: "Platinum",
    size: 54,
    price: 50000000,
  },
  {
    id: "ea2a0773-7e95-4f80-ac30-74fb26079fcb",
    name: "Elite",
    size: 36,
    price: 30000000,
  },
  {
    id: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
    name: "Standard",
    size: 6,
    price: 5000000,
  },
];

const boothData = [
  {
    id: "02232219-752a-4c43-b4df-84eef1544d77",
    number: 66,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "097f2b03-75e8-4074-a03f-50457324c47f",
    number: 85,
    boothTypeId: "6c5d06fb-1bfc-42f5-8f4f-164be24ae795",
  },
  {
    id: "09a62c82-ae5c-40b4-916e-2e3a05d9f06d",
    number: 57,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "1054c559-ff3f-4430-bd4a-77870f750c28",
    number: 145,
    boothTypeId: "ba5c74d8-3c97-406a-8cbe-2ce0c6718dc5",
  },
  {
    id: "11702b02-b7a9-4bf8-aaf3-1f8a2f2d4507",
    number: 3,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "142aebd3-3bab-42ce-9044-21e3e893f500",
    number: 55,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "19164346-b9f5-4146-8a61-ed7bf00fa032",
    number: 34,
    boothTypeId: "b475838d-ecdf-4b87-9fc3-7c2507c32353",
  },
  {
    id: "1de1937e-3225-11f1-bc45-7dc76bc49396",
    number: 101,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "1de196c3-3225-11f1-bc45-7dc76bc49396",
    number: 102,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "1de19761-3225-11f1-bc45-7dc76bc49396",
    number: 103,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "1de1977e-3225-11f1-bc45-7dc76bc49396",
    number: 104,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "1de19797-3225-11f1-bc45-7dc76bc49396",
    number: 105,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "1de197af-3225-11f1-bc45-7dc76bc49396",
    number: 106,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "1de197c4-3225-11f1-bc45-7dc76bc49396",
    number: 107,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "1de197d6-3225-11f1-bc45-7dc76bc49396",
    number: 108,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "1de197e9-3225-11f1-bc45-7dc76bc49396",
    number: 109,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "1de19858-3225-11f1-bc45-7dc76bc49396",
    number: 110,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "1de1986c-3225-11f1-bc45-7dc76bc49396",
    number: 111,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "1de1987f-3225-11f1-bc45-7dc76bc49396",
    number: 112,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "1de19893-3225-11f1-bc45-7dc76bc49396",
    number: 113,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "21a7dba1-322c-11f1-bc45-7dc76bc49396",
    number: 206,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "21a7df51-322c-11f1-bc45-7dc76bc49396",
    number: 207,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "21a7df90-322c-11f1-bc45-7dc76bc49396",
    number: 208,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "21a7dfb9-322c-11f1-bc45-7dc76bc49396",
    number: 209,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "21a7dfe1-322c-11f1-bc45-7dc76bc49396",
    number: 210,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "21a7e006-322c-11f1-bc45-7dc76bc49396",
    number: 211,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "21a7e026-322c-11f1-bc45-7dc76bc49396",
    number: 212,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "21a7e047-322c-11f1-bc45-7dc76bc49396",
    number: 213,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "21a7e068-322c-11f1-bc45-7dc76bc49396",
    number: 214,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "21a7e08b-322c-11f1-bc45-7dc76bc49396",
    number: 215,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "282b07e1-b4d4-454e-b346-86192648058c",
    number: 156,
    boothTypeId: "ba5c74d8-3c97-406a-8cbe-2ce0c6718dc5",
  },
  {
    id: "2b632520-ebcd-4670-8483-ac65121d3acc",
    number: 146,
    boothTypeId: "ba5c74d8-3c97-406a-8cbe-2ce0c6718dc5",
  },
  {
    id: "2bd2f0a2-a1db-4a31-a635-de5fbb8b10ff",
    number: 126,
    boothTypeId: "b475838d-ecdf-4b87-9fc3-7c2507c32353",
  },
  {
    id: "2c745b3c-1bec-47e6-afc8-bcdbc4612e67",
    number: 180,
    boothTypeId: "5482c819-93d6-49a8-91f5-f9561d5f1d94",
  },
  {
    id: "2cac4d45-1d7e-4ca5-bc4f-a24a66a8d5d7",
    number: 227,
    boothTypeId: "b475838d-ecdf-4b87-9fc3-7c2507c32353",
  },
  {
    id: "2d069d42-a31f-426f-ada9-8aaf0168c083",
    number: 8,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "2d79850e-87a1-4735-967a-57a0a0fc9bc9",
    number: 220,
    boothTypeId: "ea2a0773-7e95-4f80-ac30-74fb26079fcb",
  },
  {
    id: "2efeb672-bf36-4b63-b653-9fab3fa7a7cb",
    number: 69,
    boothTypeId: "6c5d06fb-1bfc-42f5-8f4f-164be24ae795",
  },
  {
    id: "3937055c-3224-11f1-bc45-7dc76bc49396",
    number: 70,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "39370874-3224-11f1-bc45-7dc76bc49396",
    number: 71,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "393708f8-3224-11f1-bc45-7dc76bc49396",
    number: 72,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "39370923-3224-11f1-bc45-7dc76bc49396",
    number: 73,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "39370949-3224-11f1-bc45-7dc76bc49396",
    number: 74,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "3937096d-3224-11f1-bc45-7dc76bc49396",
    number: 75,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "39370991-3224-11f1-bc45-7dc76bc49396",
    number: 76,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "393709b3-3224-11f1-bc45-7dc76bc49396",
    number: 77,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "393709d4-3224-11f1-bc45-7dc76bc49396",
    number: 78,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "393709f6-3224-11f1-bc45-7dc76bc49396",
    number: 79,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "39370a1d-3224-11f1-bc45-7dc76bc49396",
    number: 80,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "39370a41-3224-11f1-bc45-7dc76bc49396",
    number: 81,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "39370a65-3224-11f1-bc45-7dc76bc49396",
    number: 82,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "39370a8a-3224-11f1-bc45-7dc76bc49396",
    number: 83,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "3e1ee18c-d9f7-4401-9990-f0fc8d8c690a",
    number: 33,
    boothTypeId: "b475838d-ecdf-4b87-9fc3-7c2507c32353",
  },
  {
    id: "3e2b01cc-88c4-4e3c-a9db-772074b21baf",
    number: 59,
    boothTypeId: "b475838d-ecdf-4b87-9fc3-7c2507c32353",
  },
  {
    id: "3e984371-106a-4d66-a9bc-91834a26b59d",
    number: 115,
    boothTypeId: "6c5d06fb-1bfc-42f5-8f4f-164be24ae795",
  },
  {
    id: "3f99f174-61db-4f29-abb2-0bbc9777887f",
    number: 129,
    boothTypeId: "6c5d06fb-1bfc-42f5-8f4f-164be24ae795",
  },
  {
    id: "40925fac-ee35-4305-9837-f551e1c37db1",
    number: 63,
    boothTypeId: "b475838d-ecdf-4b87-9fc3-7c2507c32353",
  },
  {
    id: "40d95e28-5752-4255-97cf-c0321cf33669",
    number: 120,
    boothTypeId: "ea2a0773-7e95-4f80-ac30-74fb26079fcb",
  },
  {
    id: "4147bcc4-e734-4952-81e7-cbf944b35865",
    number: 11,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "428fa9ea-0386-406d-a8a7-d739a7b65299",
    number: 119,
    boothTypeId: "ea2a0773-7e95-4f80-ac30-74fb26079fcb",
  },
  {
    id: "4dbcaf34-afb4-44bc-81d9-834cddf3f592",
    number: 2,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "56863e4d-322d-11f1-bc45-7dc76bc49396",
    number: 221,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "568640a0-322d-11f1-bc45-7dc76bc49396",
    number: 222,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "568640d0-322d-11f1-bc45-7dc76bc49396",
    number: 223,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "568640f2-322d-11f1-bc45-7dc76bc49396",
    number: 224,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "58ada635-6fd8-4a63-9d80-8daf1586949d",
    number: 89,
    boothTypeId: "ea2a0773-7e95-4f80-ac30-74fb26079fcb",
  },
  {
    id: "5deabead-f297-424b-8158-117e8692bf45",
    number: 7,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "5fb15c38-6494-4855-a511-1a5d74d04c5d",
    number: 226,
    boothTypeId: "5482c819-93d6-49a8-91f5-f9561d5f1d94",
  },
  {
    id: "64e43343-65f5-4845-84fb-91f8fdbe6e6b",
    number: 174,
    boothTypeId: "5482c819-93d6-49a8-91f5-f9561d5f1d94",
  },
  {
    id: "64f9e882-c1e6-4127-b587-c0b8c15143b6",
    number: 68,
    boothTypeId: "6c5d06fb-1bfc-42f5-8f4f-164be24ae795",
  },
  {
    id: "6515a104-b528-4d2b-a144-89211501df6d",
    number: 99,
    boothTypeId: "6c5d06fb-1bfc-42f5-8f4f-164be24ae795",
  },
  {
    id: "6526c644-c194-45eb-b683-8c3945d9aa7f",
    number: 54,
    boothTypeId: "6c5d06fb-1bfc-42f5-8f4f-164be24ae795",
  },
  {
    id: "66ee554f-0f47-473f-995c-c4a2729a8b85",
    number: 154,
    boothTypeId: "ea2a0773-7e95-4f80-ac30-74fb26079fcb",
  },
  {
    id: "67cafaf1-c905-4ec5-a048-c85aae5eebfd",
    number: 182,
    boothTypeId: "5482c819-93d6-49a8-91f5-f9561d5f1d94",
  },
  {
    id: "6cacb95b-322a-11f1-bc45-7dc76bc49396",
    number: 183,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "6cad1bc5-322a-11f1-bc45-7dc76bc49396",
    number: 184,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "6cad1c69-322a-11f1-bc45-7dc76bc49396",
    number: 185,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "6cad1c9d-322a-11f1-bc45-7dc76bc49396",
    number: 186,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "6cad1ccc-322a-11f1-bc45-7dc76bc49396",
    number: 187,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "6cad1cf9-322a-11f1-bc45-7dc76bc49396",
    number: 188,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "6cad1d23-322a-11f1-bc45-7dc76bc49396",
    number: 189,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "6cad1d4c-322a-11f1-bc45-7dc76bc49396",
    number: 190,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "6cad1d75-322a-11f1-bc45-7dc76bc49396",
    number: 191,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "6cad1d9f-322a-11f1-bc45-7dc76bc49396",
    number: 192,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "6cad1dcb-322a-11f1-bc45-7dc76bc49396",
    number: 193,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "6cad1e46-322a-11f1-bc45-7dc76bc49396",
    number: 194,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "6ea46cb7-5e8f-4625-b99c-22ec4f1faa8f",
    number: 114,
    boothTypeId: "6c5d06fb-1bfc-42f5-8f4f-164be24ae795",
  },
  {
    id: "6ed35e8a-e998-4080-9df1-d0b274f44d73",
    number: 147,
    boothTypeId: "ba5c74d8-3c97-406a-8cbe-2ce0c6718dc5",
  },
  {
    id: "6ee0348f-043b-4264-9e7c-04740b5ddc98",
    number: 155,
    boothTypeId: "ba5c74d8-3c97-406a-8cbe-2ce0c6718dc5",
  },
  {
    id: "72338878-8be0-4c4a-b3fd-360a150965c8",
    number: 6,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "76154716-2ff1-4435-aa75-cf2188d71b4c",
    number: 148,
    boothTypeId: "ea2a0773-7e95-4f80-ac30-74fb26079fcb",
  },
  {
    id: "769056aa-3224-11f1-bc45-7dc76bc49396",
    number: 86,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7690588c-3224-11f1-bc45-7dc76bc49396",
    number: 87,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "76905aae-3224-11f1-bc45-7dc76bc49396",
    number: 88,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7978ecf8-d281-4906-bf30-2ff7f5cf4bb8",
    number: 27,
    boothTypeId: "b475838d-ecdf-4b87-9fc3-7c2507c32353",
  },
  {
    id: "7a2d2bb5-1300-49ec-89c6-6d953a5997ce",
    number: 117,
    boothTypeId: "b475838d-ecdf-4b87-9fc3-7c2507c32353",
  },
  {
    id: "7b4c207e-72b1-4681-8cb1-545e33038ec8",
    number: 158,
    boothTypeId: "6c5d06fb-1bfc-42f5-8f4f-164be24ae795",
  },
  {
    id: "7d2c66bf-3223-11f1-bc45-7dc76bc49396",
    number: 35,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7d2c6a3a-3223-11f1-bc45-7dc76bc49396",
    number: 36,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7d2c6a69-3223-11f1-bc45-7dc76bc49396",
    number: 37,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7d2c6a87-3223-11f1-bc45-7dc76bc49396",
    number: 38,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7d2c6aa4-3223-11f1-bc45-7dc76bc49396",
    number: 39,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7d2c6abf-3223-11f1-bc45-7dc76bc49396",
    number: 40,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7d2c6ad5-3223-11f1-bc45-7dc76bc49396",
    number: 41,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7d2c6aea-3223-11f1-bc45-7dc76bc49396",
    number: 42,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7d2c6aff-3223-11f1-bc45-7dc76bc49396",
    number: 43,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7d2c6b13-3223-11f1-bc45-7dc76bc49396",
    number: 44,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7d2c6b27-3223-11f1-bc45-7dc76bc49396",
    number: 45,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7d2c6b4a-3223-11f1-bc45-7dc76bc49396",
    number: 46,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7d2c6b62-3223-11f1-bc45-7dc76bc49396",
    number: 47,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7d2c6b76-3223-11f1-bc45-7dc76bc49396",
    number: 48,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7d2c6b89-3223-11f1-bc45-7dc76bc49396",
    number: 49,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7d2c6b9c-3223-11f1-bc45-7dc76bc49396",
    number: 50,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7d2c6bb1-3223-11f1-bc45-7dc76bc49396",
    number: 51,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7d2c6bc5-3223-11f1-bc45-7dc76bc49396",
    number: 52,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "7efa94aa-bcc6-4186-afaf-caec769c30dc",
    number: 67,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "80e0b109-10ff-4822-86d6-7f69c9984997",
    number: 9,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "80fd1f01-5df0-4f29-a05f-6d42c39806c3",
    number: 173,
    boothTypeId: "5482c819-93d6-49a8-91f5-f9561d5f1d94",
  },
  {
    id: "88c4f2e2-fde0-457c-aad3-69b4169fcce8",
    number: 228,
    boothTypeId: "b475838d-ecdf-4b87-9fc3-7c2507c32353",
  },
  {
    id: "90b6130b-2752-4bc3-af78-6960341a8224",
    number: 90,
    boothTypeId: "ea2a0773-7e95-4f80-ac30-74fb26079fcb",
  },
  {
    id: "928d4103-4502-4e4a-b05c-5f98c2e37081",
    number: 125,
    boothTypeId: "ea2a0773-7e95-4f80-ac30-74fb26079fcb",
  },
  {
    id: "942bb68c-38e9-4bca-9116-1bf9244f778a",
    number: 84,
    boothTypeId: "6c5d06fb-1bfc-42f5-8f4f-164be24ae795",
  },
  {
    id: "a3024e5b-6954-4f85-b4d6-49f429fdeb1e",
    number: 157,
    boothTypeId: "ba5c74d8-3c97-406a-8cbe-2ce0c6718dc5",
  },
  {
    id: "a810ee6e-71fb-4a01-98ac-f745fed722a1",
    number: 100,
    boothTypeId: "6c5d06fb-1bfc-42f5-8f4f-164be24ae795",
  },
  {
    id: "a9d684dd-011d-4198-ba3f-de649f1df66c",
    number: 149,
    boothTypeId: "ea2a0773-7e95-4f80-ac30-74fb26079fcb",
  },
  {
    id: "ac7f8f5f-3228-11f1-bc45-7dc76bc49396",
    number: 131,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "ac7f91ca-3228-11f1-bc45-7dc76bc49396",
    number: 132,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "ac7f9287-3228-11f1-bc45-7dc76bc49396",
    number: 133,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "ac7f92ac-3228-11f1-bc45-7dc76bc49396",
    number: 134,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "ac7f92c7-3228-11f1-bc45-7dc76bc49396",
    number: 135,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "ac7f92dc-3228-11f1-bc45-7dc76bc49396",
    number: 136,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "ac7f92f1-3228-11f1-bc45-7dc76bc49396",
    number: 137,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "ac7f9305-3228-11f1-bc45-7dc76bc49396",
    number: 138,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "ac7f9319-3228-11f1-bc45-7dc76bc49396",
    number: 139,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "ac7f932c-3228-11f1-bc45-7dc76bc49396",
    number: 140,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "ac7f9340-3228-11f1-bc45-7dc76bc49396",
    number: 141,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "ac7f9353-3228-11f1-bc45-7dc76bc49396",
    number: 142,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "ac7f9367-3228-11f1-bc45-7dc76bc49396",
    number: 143,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "ae5e9c82-5921-4700-abc3-5176fd7039be",
    number: 127,
    boothTypeId: "b475838d-ecdf-4b87-9fc3-7c2507c32353",
  },
  {
    id: "aeb43b59-5293-483b-a117-0f60ab2bb2f2",
    number: 4,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "b21c6d77-3224-11f1-bc45-7dc76bc49396",
    number: 96,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "b21c71d3-3224-11f1-bc45-7dc76bc49396",
    number: 97,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "b21c721a-3224-11f1-bc45-7dc76bc49396",
    number: 98,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "bc55f605-dc3c-493a-b45a-53cb4a9edf8d",
    number: 118,
    boothTypeId: "b475838d-ecdf-4b87-9fc3-7c2507c32353",
  },
  {
    id: "bd7586c9-e971-4a3c-aa25-3844e56bab87",
    number: 64,
    boothTypeId: "b475838d-ecdf-4b87-9fc3-7c2507c32353",
  },
  {
    id: "c1c51496-fb82-435e-ad85-3074fbd1b3ae",
    number: 153,
    boothTypeId: "ea2a0773-7e95-4f80-ac30-74fb26079fcb",
  },
  {
    id: "c4382dd2-ab15-4b58-905c-a2bcc158ed54",
    number: 53,
    boothTypeId: "6c5d06fb-1bfc-42f5-8f4f-164be24ae795",
  },
  {
    id: "c8222052-3222-11f1-bc45-7dc76bc49396",
    number: 12,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "c822231e-3222-11f1-bc45-7dc76bc49396",
    number: 13,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "c8222355-3222-11f1-bc45-7dc76bc49396",
    number: 14,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "c82223c8-3222-11f1-bc45-7dc76bc49396",
    number: 15,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "c82223e1-3222-11f1-bc45-7dc76bc49396",
    number: 16,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "c82223f7-3222-11f1-bc45-7dc76bc49396",
    number: 17,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "c822240c-3222-11f1-bc45-7dc76bc49396",
    number: 18,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "c822241f-3222-11f1-bc45-7dc76bc49396",
    number: 19,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "c8222432-3222-11f1-bc45-7dc76bc49396",
    number: 20,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "c8222446-3222-11f1-bc45-7dc76bc49396",
    number: 21,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "c8222459-3222-11f1-bc45-7dc76bc49396",
    number: 22,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "c822246d-3222-11f1-bc45-7dc76bc49396",
    number: 23,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "c8222480-3222-11f1-bc45-7dc76bc49396",
    number: 24,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "c8222495-3222-11f1-bc45-7dc76bc49396",
    number: 25,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "c82224a9-3222-11f1-bc45-7dc76bc49396",
    number: 26,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "c83e2b21-73f4-4865-8258-3e68b42321d9",
    number: 217,
    boothTypeId: "ea2a0773-7e95-4f80-ac30-74fb26079fcb",
  },
  {
    id: "c8db43eb-37eb-499a-8c6b-da7001ebd3d7",
    number: 65,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "ca6ea97c-80ec-48a1-a508-1519e3b28d90",
    number: 218,
    boothTypeId: "ea2a0773-7e95-4f80-ac30-74fb26079fcb",
  },
  {
    id: "cac66c7d-4463-4dcf-a070-2704691278dc",
    number: 94,
    boothTypeId: "ea2a0773-7e95-4f80-ac30-74fb26079fcb",
  },
  {
    id: "d2aaf4f7-fd1e-4f0b-aa70-c27a377c8738",
    number: 179,
    boothTypeId: "5482c819-93d6-49a8-91f5-f9561d5f1d94",
  },
  {
    id: "d2ef394d-a58e-4531-8014-01024f5e38b8",
    number: 144,
    boothTypeId: "6c5d06fb-1bfc-42f5-8f4f-164be24ae795",
  },
  {
    id: "d84284fb-322b-11f1-bc45-7dc76bc49396",
    number: 195,
    boothTypeId: "5482c819-93d6-49a8-91f5-f9561d5f1d94",
  },
  {
    id: "d84288f5-322b-11f1-bc45-7dc76bc49396",
    number: 196,
    boothTypeId: "5482c819-93d6-49a8-91f5-f9561d5f1d94",
  },
  {
    id: "d8428941-322b-11f1-bc45-7dc76bc49396",
    number: 197,
    boothTypeId: "5482c819-93d6-49a8-91f5-f9561d5f1d94",
  },
  {
    id: "d8428962-322b-11f1-bc45-7dc76bc49396",
    number: 198,
    boothTypeId: "5482c819-93d6-49a8-91f5-f9561d5f1d94",
  },
  {
    id: "d8428983-322b-11f1-bc45-7dc76bc49396",
    number: 202,
    boothTypeId: "5482c819-93d6-49a8-91f5-f9561d5f1d94",
  },
  {
    id: "d842899c-322b-11f1-bc45-7dc76bc49396",
    number: 203,
    boothTypeId: "5482c819-93d6-49a8-91f5-f9561d5f1d94",
  },
  {
    id: "d84289b3-322b-11f1-bc45-7dc76bc49396",
    number: 204,
    boothTypeId: "5482c819-93d6-49a8-91f5-f9561d5f1d94",
  },
  {
    id: "d84289c8-322b-11f1-bc45-7dc76bc49396",
    number: 205,
    boothTypeId: "5482c819-93d6-49a8-91f5-f9561d5f1d94",
  },
  {
    id: "de577dd1-6daa-4715-827b-87345e671958",
    number: 58,
    boothTypeId: "b475838d-ecdf-4b87-9fc3-7c2507c32353",
  },
  {
    id: "dfd78e55-61dd-4d08-a9b7-241f9e7c9413",
    number: 1,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "e478e795-34ee-47d4-a220-7d611514ef5f",
    number: 116,
    boothTypeId: "b475838d-ecdf-4b87-9fc3-7c2507c32353",
  },
  {
    id: "e6abf57c-92d4-42f1-900a-97b2fb909c41",
    number: 10,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "e775befd-b84e-4ece-8f37-e099e2e14c63",
    number: 5,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "e7c10d33-dbb1-47c8-a586-65d83fc5b2a4",
    number: 128,
    boothTypeId: "b475838d-ecdf-4b87-9fc3-7c2507c32353",
  },
  {
    id: "e9c5b604-858b-49bb-b3f2-2d16a92cd558",
    number: 175,
    boothTypeId: "5482c819-93d6-49a8-91f5-f9561d5f1d94",
  },
  {
    id: "e9ef20f6-5028-4ae1-aba4-cca410506dfc",
    number: 28,
    boothTypeId: "b475838d-ecdf-4b87-9fc3-7c2507c32353",
  },
  {
    id: "ed20f263-9227-42b5-8308-6414b16425f7",
    number: 219,
    boothTypeId: "ea2a0773-7e95-4f80-ac30-74fb26079fcb",
  },
  {
    id: "ef4d4bbc-a208-4f14-bbe4-1845ee4259ca",
    number: 172,
    boothTypeId: "5482c819-93d6-49a8-91f5-f9561d5f1d94",
  },
  {
    id: "f1009b21-c3f4-4f9d-b5d9-33670a4aece8",
    number: 95,
    boothTypeId: "ea2a0773-7e95-4f80-ac30-74fb26079fcb",
  },
  {
    id: "f3e12863-d1c3-4f30-bc06-c71e8d0df6e2",
    number: 124,
    boothTypeId: "ea2a0773-7e95-4f80-ac30-74fb26079fcb",
  },
  {
    id: "f6dbc906-ff8e-456f-a4a8-06cb43c98330",
    number: 181,
    boothTypeId: "5482c819-93d6-49a8-91f5-f9561d5f1d94",
  },
  {
    id: "f7f98ca8-e247-4aef-901f-664838d7964c",
    number: 130,
    boothTypeId: "6c5d06fb-1bfc-42f5-8f4f-164be24ae795",
  },
  {
    id: "fe1601dd-3229-11f1-bc45-7dc76bc49396",
    number: 159,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "fe1605a5-3229-11f1-bc45-7dc76bc49396",
    number: 160,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "fe160615-3229-11f1-bc45-7dc76bc49396",
    number: 161,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "fe160639-3229-11f1-bc45-7dc76bc49396",
    number: 162,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "fe160658-3229-11f1-bc45-7dc76bc49396",
    number: 163,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "fe1606ac-3229-11f1-bc45-7dc76bc49396",
    number: 164,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "fe1606c2-3229-11f1-bc45-7dc76bc49396",
    number: 165,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "fe1606d8-3229-11f1-bc45-7dc76bc49396",
    number: 166,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "fe1606eb-3229-11f1-bc45-7dc76bc49396",
    number: 167,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "fe1606fe-3229-11f1-bc45-7dc76bc49396",
    number: 168,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "fe160714-3229-11f1-bc45-7dc76bc49396",
    number: 169,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "fe160729-3229-11f1-bc45-7dc76bc49396",
    number: 170,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
  {
    id: "ff426724-7fca-48a0-80f1-9bdfee591589",
    number: 56,
    boothTypeId: "eb95b0d1-75a2-44ec-839b-f91bbbe6ba18",
  },
];

async function main() {
  console.log("🌱 Seeding...\n");

  // Hapus data lama (urutan penting karena FK)
  await prisma.exhibitors.deleteMany();
  await prisma.booths.deleteMany();
  await prisma.boothTypes.deleteMany();

  // Seed BoothTypes dengan ID yang fixed
  console.log("📋 Seeding booth types...");
  await prisma.boothTypes.createMany({
    data: boothTypeData.map((t) => ({ ...t, isActive: true })),
  });
  console.log(`  ✅ ${boothTypeData.length} tipe booth berhasil dibuat`);

  // Seed Booths dengan ID dan boothTypeId yang fixed
  console.log("\n🏪 Seeding booths...");
  await prisma.booths.createMany({
    data: boothData.map((b) => ({
      ...b,
      isBooked: false,
      isActive: true,
    })),
  });
  console.log(`  ✅ ${boothData.length} booth berhasil dibuat`);

  // Ringkasan per tipe
  console.log("\n📊 Ringkasan booth per tipe:");
  for (const type of boothTypeData) {
    const count = boothData.filter((b) => b.boothTypeId === type.id).length;
    console.log(
      `  - ${type.name} (${type.size} m², Rp ${type.price.toLocaleString("id-ID")}): ${count} booth`,
    );
  }

  console.log(`\n🎉 Seeding selesai!`);
  console.log(`   - ${boothTypeData.length} tipe booth`);
  console.log(`   - ${boothData.length} booth`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
