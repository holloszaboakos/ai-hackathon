import React, { Component, useEffect, useState } from 'react'
import { addShipment, selectCart, subtractShipment } from './reducers/cartReducer'
import { useAppDispatch, useAppSelector } from '../hooks'


export const Recipe = () => {
    const dispatch = useAppDispatch()
    const cart = useAppSelector(selectCart)
    const [shipmentChecked, setShipmentChecked] = useState(false)

    useEffect(() => {
        // returned function will be called on component unmount 
        return () => {
            if (shipmentChecked) subtractShipment()
        }
    }, [])

    return (
        <div className="container">
            <div className="collection">
                <li className="collection-item">
                    <label>
                        <input type="checkbox" checked={shipmentChecked} onChange={() => {
                            if (shipmentChecked) {
                                dispatch(subtractShipment());
                            }
                            else {
                                dispatch(addShipment());
                            }
                            setShipmentChecked(!shipmentChecked)
                        }} />
                        <span>Shipping(+6$)</span>
                    </label>
                </li>
                <li className="collection-item"><b>Total: {cart.total} $</b></li>
            </div>
            <div className="checkout">
                <button className="waves-effect waves-light btn">Checkout</button>
            </div>
        </div>
    )
}


export default Recipe;