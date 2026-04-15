<script setup lang="ts">
defineProps<{
  columns: { key: string; label: string }[]
  data: any[]
  loading?: boolean
}>()
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <!-- TABLE (desktop) -->
    <div class="hidden md:block overflow-x-auto">
      <table class="min-w-full text-sm">
        <!-- HEADER -->
        <thead class="bg-gray-50 text-gray-700 text-xs uppercase tracking-wide">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3 border-b text-center font-semibold"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>

        <!-- BODY -->
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="row in data"
            :key="row.id"
            class="transition-all duration-150 hover:bg-gray-50"
          >
            <td v-for="col in columns" :key="col.key" class="px-4 py-3 text-center align-middle">
              <slot :name="col.key" :row="row">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MOBILE CARD -->
    <div class="md:hidden space-y-3 p-4">
      <div
        v-for="row in data"
        :key="row.id"
        class="p-4 border border-gray-200 rounded-xl shadow-sm bg-white"
      >
        <div
          v-for="col in columns"
          :key="col.key"
          class="flex justify-between items-center text-sm py-2 border-b last:border-0"
        >
          <!-- LABEL -->
          <span class="text-gray-500 text-xs">
            {{ col.label }}
          </span>

          <!-- VALUE -->
          <span class="font-medium text-right text-gray-800">
            <slot :name="col.key" :row="row">
              {{ row[col.key] }}
            </slot>
          </span>
        </div>
      </div>
    </div>

    <!-- EMPTY -->
    <div v-if="!data.length" class="p-8 text-center text-gray-400 text-sm">Không có dữ liệu</div>
  </div>
</template>
