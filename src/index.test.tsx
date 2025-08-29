import { describe, expect, it, vitest } from 'vitest';
import { render } from '@testing-library/react';
import { type FC } from 'react';
import { allSettled, createEvent, createStore, fork } from 'effector';
import { Provider } from 'effector-react';
import { useUnitShape } from './use-unit-shape';

const sleep = () => Promise.resolve();

describe('useUnitShape', () => {
    it('units', async () => {
        const $store = createStore(1);
        const setStore = createEvent<number>();
        $store.on(setStore, (_, val) => val);
        const useUnitShapeStore = vitest.fn(useUnitShape);
        const scope = fork();
        let changeStore: (value: number) => void;
        const C: FC = () => {
            useUnitShapeStore($store);

            changeStore = useUnitShape(setStore);

            return null;
        };
        render(
            <Provider value={scope} >
                <C />
            </Provider>
        )

        expect(useUnitShapeStore).toHaveBeenCalledTimes(1);
        expect(useUnitShapeStore).toHaveNthReturnedWith(1, 1);

        await allSettled(setStore, { scope, params: 2 });

        expect(useUnitShapeStore).toHaveBeenCalledTimes(2);
        expect(useUnitShapeStore).toHaveNthReturnedWith(2, 2);
        expect(scope.getState($store)).toEqual(2);
        expect(scope.getState($store)).toEqual(2);

        changeStore!(3);
        await sleep();

        expect(useUnitShapeStore).toHaveBeenCalledTimes(3);
        expect(useUnitShapeStore).toHaveNthReturnedWith(3, 3);
        expect(scope.getState($store)).toEqual(3);
    })
    it('flat unit object', async () => {
        const $store = createStore(1);
        const setStore = createEvent<number>();
        const object = {
            $store,
            setStore,
            primitive: true,
        }
        $store.on(setStore, (_, val) => val);
        const spy = vitest.fn();
        const scope = fork();
        let changeStore: (value: number) => void;
        const C: FC = () => {
            const { store, setStore, primitive } = useUnitShape(object);
            spy({ store, setStore, primitive })

            changeStore = setStore

            return null;
        };
        render(
            <Provider value={scope} >
                <C />
            </Provider>
        )

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).nthCalledWith(1, { store: 1, setStore: expect.any(Function), primitive: true });

        await allSettled(setStore, { scope, params: 2 });

        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).nthCalledWith(2 , { store: 2, setStore: expect.any(Function), primitive: true });
        expect(scope.getState($store)).toEqual(2);

        changeStore!(3);
        await sleep();

        expect(spy).toHaveBeenCalledTimes(3);
        expect(spy).nthCalledWith(3, { store: 3, setStore: expect.any(Function), primitive: true });
        expect(scope.getState($store)).toEqual(3);
    })
    it('nested unit object', async () => {
        const $store1 = createStore(1);
        const setStore1 = createEvent<number>();
        const $store2 = createStore(2);
        const setStore2 = createEvent<number>();
        const $store3 = createStore(3);
        const setStore3 = createEvent<number>(); 
        const object = {
            $store1,
            setStore1,
            nested1: {
                $store2,
                setStore2,
                nested2: {
                    $store3,
                    setStore3,
                }
            }
        }
        $store1.on(setStore1, (_, val) => val);
        $store2.on(setStore2, (_, val) => val);
        $store3.on(setStore3, (_, val) => val);
        const spy = vitest.fn();
        const scope = fork();
        let changeStore1: (value: number) => void;
        let changeStore2: (value: number) => void;
        let changeStore3: (value: number) => void;

        const C: FC = () => {
            const { 
                store1, 
                setStore1,
                nested1: {
                    store2,
                    setStore2,
                    nested2: {
                        store3,
                        setStore3
                    }
                }
            } = useUnitShape(object);
            spy({ 
                store1,
                store2,
                store3,
                setStore1,
                setStore2,
                setStore3
            })

            changeStore1 = setStore1;
            changeStore2 = setStore2;
            changeStore3 = setStore3;

            return null;
        };
        render(
            <Provider value={scope} >
                <C />
            </Provider>
        )

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).nthCalledWith(1, { 
            store1: 1, 
            setStore1: expect.any(Function),
            store2: 2,
            setStore2: expect.any(Function),
            store3: 3,
            setStore3: expect.any(Function)
        });
        expect(scope.getState($store1)).toEqual(1);
        expect(scope.getState($store2)).toEqual(2);
        expect(scope.getState($store3)).toEqual(3);


        await allSettled(setStore1, { scope, params: 2 });
        await allSettled(setStore2, { scope, params: 3 });
        await allSettled(setStore3, { scope, params: 4 });


        expect(spy).toHaveBeenCalledTimes(4);
        expect(spy).nthCalledWith(2, { 
            store1: 2, 
            setStore1: expect.any(Function),
            store2: 2,
            setStore2: expect.any(Function),
            store3: 3,
            setStore3: expect.any(Function)
        });
        expect(spy).nthCalledWith(3, { 
            store1: 2, 
            setStore1: expect.any(Function),
            store2: 3,
            setStore2: expect.any(Function),
            store3: 3,
            setStore3: expect.any(Function)
        });
        expect(spy).nthCalledWith(4, { 
            store1: 2, 
            setStore1: expect.any(Function),
            store2: 3,
            setStore2: expect.any(Function),
            store3: 4,
            setStore3: expect.any(Function)
        });
        expect(scope.getState($store1)).toEqual(2);
        expect(scope.getState($store2)).toEqual(3);
        expect(scope.getState($store3)).toEqual(4);

        changeStore1!(3);
        changeStore2!(4);
        changeStore3!(5);

        await sleep();

        expect(spy).toHaveBeenCalledTimes(5);
        expect(spy).nthCalledWith(5, { 
            store1: 3, 
            setStore1: expect.any(Function),
            store2: 4,
            setStore2: expect.any(Function),
            store3: 5,
            setStore3: expect.any(Function)
        });
        expect(scope.getState($store1)).toEqual(3);
        expect(scope.getState($store2)).toEqual(4);
        expect(scope.getState($store3)).toEqual(5);
    })
    it('unused units does not affect rendering', async () => {
        const $unusedStore1 = createStore(1);
        const $unusedStore2 = createStore(2);
        const object = {
            $store1: createStore(2),
            $unusedStore1,
            nested1: {
                $store2: createStore(2),
                $unusedStore2,
            }
        }
        const spy = vitest.fn();
        const scope = fork();

        const C: FC = () => {
            // eslint-disable-next-line
            const { store1, nested1: { store2 } } = useUnitShape(object);
            spy();
            return null;
        };
        render(
            <Provider value={scope} >
                <C />
            </Provider>
        )

        await allSettled($unusedStore1, { scope, params: 3 });
        await allSettled($unusedStore2, { scope, params: 4 });

        expect(spy).toHaveBeenCalledTimes(1);
    })
})