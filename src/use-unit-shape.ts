import { type Store, type Event, type Effect, type Unit, is } from 'effector';
import {useUnit} from 'effector-react';
import { useMemo, useRef } from 'react';

type UnitRecord = Record<keyof any, any>;
type UnitShape = Unit<any> | UnitRecord;

type ReactHandler<Params, Result> = Params extends void
    ? () => Result
    : (payload: Params) => Result;

type GetUnitValue<U extends Unit<any>> = U extends Store<infer StoreValue>
    ? StoreValue
    : U extends Event<infer EventPayload>
        ? ReactHandler<EventPayload, void>
        : U extends Effect<infer EffectParams, infer EffectResult>
            ? ReactHandler<EffectParams, Promise<EffectResult>>
            : never

type GetUnitShapeValue<Shape extends UnitShape> = Shape extends Unit<any> 
    ? GetUnitValue<Shape>
    : {
        [K in keyof Shape as (
            Shape[K] extends Store<any>
                ? K extends `$${infer KeyWithoutPrefix}`
                    ? KeyWithoutPrefix
                    : K
                : K
        )]: Shape[K] extends Unit<any>
            ? GetUnitValue<Shape[K]>
            : Shape[K] extends UnitShape
                ? GetUnitShapeValue<Shape[K]>
                : Shape[K]
    };


export const useUnitShape = <Shape extends UnitShape>(shape: Shape): GetUnitShapeValue<Shape> => {
    const shapeRef = useRef<Shape>(undefined);
    if (shapeRef.current === undefined) {
        shapeRef.current = shape;
    };
    if (shapeRef.current !== shape) {
        console.error('Passed shape to "useUnitShape" hook changed. It is not supported.')
    }

    // eslint-disable-next-line
    if (is.unit(shape)) return useUnit(shape as any) as any;

    // eslint-disable-next-line
    const proxy = useMemo(() => new Proxy(
        {},
        {
            get: (_, key) => {
                const shapeKey = getShapeKey(shape, key);
                if (shapeKey === undefined) return undefined;
                const shapeField = shape[shapeKey];

                if (is.unit(shapeField)) {
                    // eslint-disable-next-line
                    return useUnit(shapeField as any);
                }
                
                if (!!shapeField && typeof shapeField === 'object') {
                    // eslint-disable-next-line
                    return useUnitShape(shapeField);
                }

                return shapeField
            }
        }
    ), [shape]);

    return proxy as any;
};

const getShapeKey = (shape: UnitRecord, key: keyof UnitRecord) => {
    if (key in shape) return key;
    const keyWithPrefix = `$${String(key)}`;
    if (keyWithPrefix in shape && is.store(shape[keyWithPrefix])) return keyWithPrefix;
    return undefined;
}