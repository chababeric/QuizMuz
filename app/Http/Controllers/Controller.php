<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

abstract class Controller
{
    /**
     * Update the `order` column of several models at once.
     *
     * Loads every model in a single query and saves only the ones whose order changed,
     * inside one transaction. Throws ModelNotFoundException if any id is missing.
     *
     * @param class-string<\Illuminate\Database\Eloquent\Model> $modelClass
     * @param array<int, array{id: int, order: int}> $items
     */
    protected function updateOrders(string $modelClass, array $items): void
    {
        $orders = collect($items)->pluck('order', 'id');
        $models = $modelClass::findOrFail($orders->keys()->all());

        DB::transaction(function () use ($models, $orders) {
            foreach ($models as $model) {
                $model->order = $orders[$model->id];
                $model->save();
            }
        });
    }
}
