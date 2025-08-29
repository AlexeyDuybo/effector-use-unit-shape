import { createStore, createEvent, createEffect } from 'effector';
import { it, expectTypeOf } from 'vitest';
import { useUnitShape } from './use-unit-shape';

it('types', () => {
    expectTypeOf(useUnitShape(createStore(''))).toEqualTypeOf<string>();
    expectTypeOf(useUnitShape(createEvent())).toEqualTypeOf<() => void>();
    expectTypeOf(useUnitShape(createEvent<number>())).toEqualTypeOf<(param: number) => void>();
    expectTypeOf(useUnitShape(createEffect<string, number>())).toEqualTypeOf<(param: string) => Promise<number>>();
    expectTypeOf(useUnitShape(createEffect<void, number>())).toEqualTypeOf<() => Promise<number>>();
    expectTypeOf(useUnitShape({
        $storeA: createStore(''),
        storeB: createStore(1),
        stringEvent: createEvent<string>(),
        voidEvent: createEvent(),
        numberEffect: createEffect<number, number>(),
        voidEffect: createEffect<void, number>(),
        primitive: true,
    })).toEqualTypeOf<{
        storeA: string,
        storeB: number,
        stringEvent: (param: string) => void,
        voidEvent: () => void,
        numberEffect: (param: number) => Promise<number>,
        voidEffect: () => Promise<number>,
        primitive: boolean,
    }>();
    expectTypeOf(useUnitShape({
        $storeA: createStore(''),
        nested1: {
            $storeB: createStore(1),
            nested2: {
                $storeC: createStore(true),
            }
        }
    })).toEqualTypeOf<{ storeA: string, nested1: { storeB: number, nested2: { storeC: boolean } } }>()
})