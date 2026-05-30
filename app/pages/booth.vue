<script lang="ts" setup>
// helper: create a booth object quickly
function b(num: number, available = false, catIdx = 1) {
    return {
        boothNumber: num,
        isAvailable: available,
        category: (boothCategory.find((c) => c.id === catIdx) ?? boothCategory[0])!
    }
}


const boothCategory = [
    { id: 1, name: 'Standard', color: 'gray', hex: '#4B5563' },
    { id: 2, name: 'Platinum', color: 'amber', hex: '#D97706' },
    { id: 3, name: 'Gold', color: 'yellow', hex: '#CA8A04' },
    { id: 4, name: 'Silver', color: 'slate', hex: '#475569' },
    { id: 5, name: 'Media', color: 'emerald', hex: '#059669' },
    { id: 6, name: 'Premium', color: 'green', hex: '#16A34A' },
    { id: 7, name: 'Elite', color: 'blue', hex: '#2563EB' },
]

const data = ref([
    {
        boothPosition: 'top',
        rows: [
            {
                col: 1,
                booths: [b(15), b(16), b(45), b(46), b(47), b(75), b(76), b(77), b(78), b(106), b(107), b(108), b(136), b(137), b(138), b(139), b(164), b(165), b(166), b(187), b(189), b(190), b(210), b(211), b(212), b(224)]
            }
        ]
    },
    {
        boothPosition: 'left',
        rows: [
            {
                col: 1,
                booths: [b(1), b(2), b(3), b(4), b(5), b(6), b(7), b(8), b(9), b(10), b(11), b(12), b(13), b(14)]
            }
        ]
    },
    {
        boothPosition: 'inside',
        hasStage: true,
        rowGroups: [
            // Row Group 1: 8 cols × 3 rows
            // booths order: [left1,left2,left3, rightBot,rightMid,rightTop]
            [
                { col: 1, booths: [b(17), b(18), b(19), b(42), b(43), b(44)] },
                { col: 2, booths: [b(48), b(49), b(50), b(72), b(73), b(74)] },
                { col: 3, booths: [b(79), b(80), b(81), b(103), b(104), b(105)] },
                { col: 4, booths: [b(109), b(110), b(111), b(133), b(134), b(135)] },
                { col: 5, booths: [b(139), b(140), b(141), b(161), b(162), b(163)] },
                { col: 6, booths: [b(167), b(168), b(169), b(184), b(185), b(186)] },
                { col: 7, booths: [b(191), b(192), b(193), b(207), b(208), b(209)] },
                { col: 8, booths: [b(213), b(214), b(215), b(221), b(222), b(223)] },
            ],
            // Row Group 2: 8 cols, col 8 only 2 rows
            [
                { col: 1, booths: [b(20), b(21), b(22), b(39), b(40), b(41)] },
                { col: 2, booths: [b(51), b(52), b(53, false, 5), b(69, false, 5), b(70), b(71)] },
                { col: 3, booths: [b(82), b(83), b(84, false, 5), b(100, false, 5), b(101), b(102)] },
                { col: 4, booths: [b(112), b(113), b(114, false, 5), b(130, false, 5), b(131), b(132)] },
                { col: 5, booths: [b(142), b(143), b(144, false, 5), b(158, false, 5), b(159), b(160)] },
                { col: 6, booths: [b(170), b(172, false, 3), b(173, false, 3), b(181, false, 3), b(182, false, 3), b(183)] },
                { col: 7, booths: [b(194), b(195, false, 3), b(196, false, 3), b(204, false, 3), b(205, false, 3), b(206)] },
                { col: 8, booths: [b(217), b(218), b(219), b(220)] }, // 2 rows
            ],
            // Row Group 3: 5 cols × 4 rows (col 5 = 3 rows) + Audiens Area
            [
                { col: 1, booths: [b(23), b(24), b(25), b(26), b(35), b(36), b(37), b(38)] },
                { col: 2, booths: [b(54, false, 5), b(55), b(56), b(57), b(65), b(66), b(67), b(68, false, 5)] },
                { col: 3, booths: [b(85, false, 5), b(86), b(87), b(88), b(96), b(97), b(98), b(99, false, 5)] },
                { col: 4, booths: [b(115, false, 5), b(116), b(117), b(118), b(126), b(127), b(128), b(129, false, 5)] },
                { col: 5, booths: [b(145), b(146), b(147), b(155), b(156), b(157)] }, // 3 rows
                { isAudiens: true }, // large box: height≈3 items, width≈5 items
            ],
            // Row Group 4: 7 cols × 2 rows
            [
                { col: 1, booths: [b(27), b(28), b(33), b(34)] },
                { col: 2, booths: [b(58), b(59), b(63), b(64)] },
                { col: 3, booths: [b(89), b(90), b(94), b(95)] },
                { col: 4, booths: [b(119), b(120), b(124), b(125)] },
                { col: 5, booths: [b(148), b(149), b(153), b(154)] },
                { col: 6, booths: [b(174, false, 3), b(175, false, 3), b(179, false, 3), b(180, false, 3)] },
                { col: 7, booths: [b(197, false, 3), b(198, false, 3), b(202, false, 3), b(203, false, 3)] },
            ],
        ]
    },
    {
        boothPosition: 'bottom',
        rows: [
            {
                col: 1,
                booths: [
                    b(29, false, 5), b(30, false, 5), b(31, false, 5), b(32, false, 5),
                    b(60, false, 5), b(61, false, 5), b(62, false, 5),
                    b(91, false, 5), b(92, false, 5), b(93, false, 5),
                    b(121, false, 5), b(122, false, 5), b(123, false, 5),
                    b(150, false, 5), b(151, false, 5), b(152, false, 5),
                    b(176, false, 5), b(177, false, 5), b(178, false, 5),
                    b(199, false, 5), b(200, false, 5), b(201, false, 5), b(225, false, 5)
                ]
            }
        ],
        cornerData: b(226, false, 3)
    },
    {
        boothPosition: 'right',
        rows: [
            {
                col: 1,
                booths: [
                    b(26), b(27), b(28)
                ]
            }
        ]
    }
])

</script>

<template>
    <UDashboardPanel id="booth">
        <template #header>
            <UDashboardNavbar title="Booth">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <div>
                <div class="flex gap-1">
                    <div class="flex flex-col gap-1 w-fit">
                        <div
                            class="outline w-7.5 px-1 flex justify-center items-center rounded-sm text-sm [writing-mode:vertical-lr]">
                            Masuk <span>
                                <UIcon name="i-lucide-arrow-right" />
                            </span></div>
                        <div v-if="data[1]?.boothPosition == 'left' && data[1]?.rows?.[0]"
                            class="flex flex-col-reverse gap-1">
                            <div v-for="(boothLeft, indexLeft) in data[1].rows[0].booths" :key="indexLeft"
                                class="outline size-7.5 flex justify-center items-center rounded-sm text-xs"
                                :style="{ backgroundColor: boothLeft.category.hex }">
                                {{ boothLeft.boothNumber }}</div>

                        </div>
                        <div
                            class="outline w-7.5 px-1 flex justify-center items-center rounded-sm text-sm [writing-mode:vertical-lr]">
                            Keluar <span>
                                <UIcon name="i-lucide-arrow-left" />
                            </span></div>
                    </div>
                    <!-- center: top row + inside rowGroups -->
                    <div class="flex gap-2">
                        <div>
                            <!-- Top row -->
                            <div v-if="data[0]?.boothPosition == 'top' && data[0]?.rows?.[0]" class="flex gap-1 h-fit">
                                <div v-for="booth, index in data[0]?.rows?.[0]?.booths" :key="index"
                                    class="outline size-7.5 flex justify-center items-center rounded-sm text-xs cursor-pointer"
                                    :style="{ backgroundColor: booth.category.hex }">
                                    {{ booth.boothNumber }}
                                </div>
                            </div>

                            <!-- Inside rowGroups (4 groups, variable heights) -->
                            <template v-for="(rowGroup, rgIndex) in data[2]?.rowGroups" :key="rgIndex">
                                <div class="h-8"></div>
                                <div class="flex items-start">
                                    <template v-for="(item, itemIndex) in rowGroup" :key="itemIndex">

                                        <!-- Audiens Area block -->
                                        <template v-if="item.isAudiens">
                                            <div class="w-12"></div>
                                            <div class="outline rounded flex items-center justify-center text-xs font-semibold text-center leading-tight"
                                                style="width:166px; height:98px">
                                                Audiens<br>Area
                                            </div>
                                        </template>

                                        <!-- Regular booth column -->
                                        <template v-else>
                                            <div class="w-12"></div>
                                            <div v-if="item.booths" class="grid grid-cols-2 gap-1 w-[60px]"
                                                :style="`grid-template-rows: repeat(${item.booths.length / 2}, 30px)`">
                                                <!-- left half: row 1,2,...n -->
                                                <template
                                                    v-for="(booth, i) in item.booths.slice(0, item.booths.length / 2)"
                                                    :key="'l-' + rgIndex + '-' + itemIndex + '-' + i">
                                                    <div v-if="booth"
                                                        class="outline size-7.5 flex justify-center items-center rounded-sm text-xs cursor-pointer col-start-1"
                                                        :style="`grid-row:${i + 1}; background-color: ${booth.category.hex}`">
                                                        {{ booth.boothNumber }}
                                                    </div>
                                                </template>
                                                <!-- right half: reversed (bottom→top) -->
                                                <template
                                                    v-for="(booth, i) in item.booths.slice(item.booths.length / 2)"
                                                    :key="'r-' + rgIndex + '-' + itemIndex + '-' + i">
                                                    <div v-if="booth"
                                                        class="outline size-7.5 flex justify-center items-center rounded-sm text-xs cursor-pointer col-start-2"
                                                        :style="`grid-row:${item.booths.length / 2 - i}; background-color: ${booth.category.hex}`">
                                                        {{ booth.boothNumber }}
                                                    </div>
                                                </template>
                                            </div>
                                        </template>

                                    </template>
                                </div>
                            </template>

                            <!-- Right row -->
                            <div v-if="data[4]?.boothPosition == 'right' && data[4]?.rows?.[0]"
                                class="flex flex-col-reverse gap-1 items-end">
                                <div v-for="booth, index in data[4]?.rows?.[0]?.booths" :key="index"
                                    class="outline size-7.5 flex justify-center items-center rounded-sm text-xs cursor-pointer"
                                    :style="{ backgroundColor: booth.category.hex }">
                                    {{ booth.boothNumber }}
                                </div>
                            </div>

                            <!-- Bottom row -->
                            <div v-if="data[3]?.boothPosition == 'bottom' && data[3]?.rows?.[0]"
                                class="flex h-fit items-end mt-1">
                                <div class="flex gap-1 pr-1">
                                    <div v-for="booth, index in data[3]?.rows?.[0]?.booths" :key="index"
                                        class="outline size-7.5 flex justify-center items-center rounded-sm text-xs cursor-pointer"
                                        :style="{ backgroundColor: booth.category.hex }">
                                        {{ booth.boothNumber }}
                                    </div>
                                </div>
                                <div v-if="data[3]?.cornerData"
                                    class="outline h-7.5 flex-1 flex justify-center items-center rounded-sm text-xs cursor-pointer min-w-[60px] ml-1"
                                    :style="{ backgroundColor: data[3].cornerData.category.hex }">
                                    {{ data[3].cornerData.boothNumber }}
                                </div>
                            </div>
                        </div>

                        <!-- Stage: vertical rectangle on far right -->
                        <div v-if="data[2]?.hasStage" class="flex items-center self-stretch ml-2 mt-28">
                            <div class="outline rounded-sm flex justify-center items-center text-xs font-semibold [writing-mode:vertical-lr]"
                                style="width:30px; height:210px">
                                STAGE
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </UDashboardPanel>
</template>