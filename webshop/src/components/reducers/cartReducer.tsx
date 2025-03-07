import Item1 from '../../images/item1.jpg'
import Item2 from '../../images/item2.jpg'
import Item3 from '../../images/item3.jpg'
import Item4 from '../../images/item4.jpg'
import Item5 from '../../images/item5.jpg'
import Item6 from '../../images/item6.jpg'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store'

const initialState: State = {
    items: [
        { id: 1, title: 'Winter body', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima, ex.", price: 110, img: Item1 } as ShopItem,
        { id: 2, title: 'Adidas', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima, ex.", price: 80, img: Item2 } as ShopItem,
        { id: 3, title: 'Vans', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima, ex.", price: 120, img: Item3 } as ShopItem,
        { id: 4, title: 'White', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima, ex.", price: 260, img: Item4 } as ShopItem,
        { id: 5, title: 'Cropped-sho', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima, ex.", price: 160, img: Item5 } as ShopItem,
        { id: 6, title: 'Blues', desc: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima, ex.", price: 90, img: Item6 } as ShopItem
    ],
    addedItems: [],
    total: 0,

}

export const storeSlice = createSlice({
    name: 'cart',
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<number>) => {
            let addedItem = state.items.find(item => item.id === action.payload)
            if (addedItem === undefined) {
                return;
            }
            //check if the action id exists in the addedItems
            let existed_item = state.addedItems.find(item => action.payload === item.id)
            if (existed_item) {
                existed_item.quantity += 1
                state.total += addedItem.price
            }
            else {
                state.addedItems.push({...addedItem, quantity:1})
                state.total += addedItem.price
            }
        },
        removeItem: (state, action: PayloadAction<number>) => {
            let itemToRemove = state.addedItems.find(item => action.payload === item.id)
            if (itemToRemove === undefined) {
                return;
            }
            let new_items = state.addedItems.filter(item => action.payload !== item.id)

            //calculating the total
            let newTotal = state.total - (itemToRemove.price * itemToRemove.quantity)
            console.log(itemToRemove)

            state.addedItems = new_items
            state.total = newTotal
        },
        // Use the PayloadAction type to declare the contents of `action.payload`
        addQuantity: (state, action: PayloadAction<number>) => {
            let addedItem = state.addedItems.find(item => item.id === action.payload)
            if (addedItem === undefined) {
                return;
            }

            addedItem.quantity += 1
            let newTotal = state.total + addedItem.price
            state.total = newTotal
        },
        subtractQuantity: (state, action: PayloadAction<number>) => {
            let addedItem = state.addedItems.find(item => item.id === action.payload)
            if (addedItem === undefined) {
                return;
            }
            //if the qt == 0 then it should be removed
            else if (addedItem.quantity === 1) {
                let new_items = state.addedItems.filter(item => item.id !== action.payload)
                let newTotal = state.total - addedItem.price
                
                state.addedItems = new_items
                state.total = newTotal
            }
            else {
                addedItem.quantity -= 1
                let newTotal = state.total - addedItem.price
                state.total = newTotal
            }
        },
        addShipment: (state) => {
            state.total += 6
        },
        subtractShipment: (state) => {
            state.total -= 6
        }
    }
})

export const { addToCart, removeItem, addQuantity, subtractQuantity, addShipment, subtractShipment } = storeSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectCart : (state: RootState) => State = (state: RootState) => state.cart

export default storeSlice.reducer
