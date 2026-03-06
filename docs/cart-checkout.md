# Cart & Checkout Guide

This guide explains the shopping cart and checkout functionality in the Remix Learning E-commerce application.

## Overview

The application implements a session-based shopping cart system with a multi-step checkout process. Cart data is stored in the user's session and persists across page reloads.

## Cart Management

### Cart Structure

**File:** `app/lib/cart-session.server.ts`

```typescript
type Cart = {
  items: CartItem[];
};

type CartItem = {
  productId: number;
  quantity: number;
};
```

### Cart Functions

#### Get Cart

**`getCart(request: Request)`**

Retrieves the current user's cart from session:

```typescript
const cart = await getCart(request);
// Returns { items: [{ productId, quantity }, ...] }
```

#### Add Item to Cart

**`addItemToCart(request: Request, productId: number, quantity?: number)`**

Adds a product to the cart or updates quantity if already present:

```typescript
const { cart, headers } = await addItemToCart(request, productId, 2);
// Returns updated cart and headers to set cookie
```

#### Update Cart Item

**`updateCartItem(request: Request, productId: number, quantity: number)`**

Updates the quantity of a specific cart item:

```typescript
const result = await updateCartItem(request, productId, 3);
if (result) {
  // Returns { cart, headers } if item exists
}
```

#### Remove Item from Cart

**`removeCartItem(request: Request, productId: number)`**

Removes a product from the cart:

```typescript
const { cart, headers } = await removeCartItem(request, productId);
```

#### Clear Cart

**`clearCart(request: Request)`**

Removes all items from the cart:

```typescript
const { cart, headers } = await clearCart(request);
```

### Saving Cart to Session

**`saveCart(request: Request, cart: Cart)`**

Saves cart data to session and returns headers:

```typescript
const headers = await saveCart(request, cart);
return json(data, { headers });
```

## Cart Page

**Route:** `/cart`

**File:** `app/routes/cart.tsx`

### Features

- Display all cart items with product details
- Update item quantities
- Remove items from cart
- Calculate totals (items count, subtotal, shipping, total)
- Proceed to checkout
- Clear entire cart
- Continue shopping

### Data Loading

The cart page loader:
1. Retrieves cart from session
2. Fetches product details for each cart item
3. Calculates totals including discounts
4. Returns cart items with full product information

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const cart = await getCart(request);
  
  // Fetch product details
  const cartItemsWithProducts = await Promise.all(
    cart.items.map(async (item) => {
      const product = await fetchProductById(String(item.productId));
      return { ...item, product };
    })
  );
  
  // Calculate totals
  const totalPrice = cartItemsWithProducts.reduce((sum, item) => {
    const discountedPrice = item.product.price * 
      (1 - item.product.discountPercentage / 100);
    return sum + discountedPrice * item.quantity;
  }, 0);
  
  return { items: cartItemsWithProducts, totalPrice };
}
```

### Cart Actions

**Route:** `/cart/actions`

**File:** `app/routes/cart.actions.tsx`

Handles cart mutations via form actions:

- **Add item:** `action=add&productId=X&quantity=Y`
- **Update item:** `action=update&productId=X&quantity=Y`
- **Remove item:** `action=remove&productId=X`
- **Clear cart:** `action=clear`

**Example:**
```typescript
<fetcher.Form method="post" action="/cart/actions">
  <input type="hidden" name="action" value="update" />
  <input type="hidden" name="productId" value={productId} />
  <input type="hidden" name="quantity" value={newQuantity} />
  <button type="submit">Update</button>
</fetcher.Form>
```

## Checkout Process

The checkout is a multi-step process with three stages:

1. **Address** - Shipping address information
2. **Payment** - Payment method and details
3. **Review** - Review order and place it

### Checkout Layout

**Route:** `/checkout`

**File:** `app/routes/checkout.tsx`

Provides the checkout layout with step navigation:

```typescript
const steps = [
  { id: "address", label: "Address", path: "/checkout/address" },
  { id: "payment", label: "Payment", path: "/checkout/payment" },
  { id: "review", label: "Review", path: "/checkout/review" },
];
```

### Checkout Requirements

The checkout loader ensures:
- User is authenticated (`requireUserSession`)
- Cart is not empty
- Redirects to `/checkout/address` if accessing `/checkout` directly

### Step 1: Address

**Route:** `/checkout/address`

**File:** `app/routes/checkout.address.tsx`

Collects shipping address information:

- Full name
- Address line 1
- Address line 2 (optional)
- City
- State/Province
- ZIP/Postal code
- Country
- Phone number

**Data Storage:**

Address data is stored in session using `checkoutDataKey`:

```typescript
const session = await getSession(request.headers.get("Cookie"));
session.set(checkoutDataKey, {
  address: {
    fullName,
    addressLine1,
    addressLine2,
    city,
    state,
    zipCode,
    country,
    phone,
  },
});
```

### Step 2: Payment

**Route:** `/checkout/payment`

**File:** `app/routes/checkout.payment.tsx`

Collects payment information:

- Payment method (credit card, debit card, etc.)
- Card number
- Cardholder name
- Expiry date
- CVV

**Data Storage:**

Payment data is added to the same session key:

```typescript
const checkoutData = session.get(checkoutDataKey) || {};
checkoutData.payment = {
  method,
  cardNumber,
  cardholderName,
  expiryDate,
  cvv,
};
session.set(checkoutDataKey, checkoutData);
```

### Step 3: Review

**Route:** `/checkout/review`

**File:** `app/routes/checkout.review.tsx`

Final review and order placement:

**Features:**
- Display order summary
- Show shipping address
- Show payment method (masked)
- Terms and conditions acceptance
- Place order button

**Order Placement:**

The review page's action handler:
1. Validates terms acceptance
2. Retrieves checkout data from session
3. Gets current cart
4. Creates order in database
5. Clears cart
6. Clears checkout data
7. Redirects to order confirmation

```typescript
export async function action({ request }: Route.ActionArgs) {
  // Validate terms
  const formData = await request.formData();
  const termsAccepted = formData.get("terms");
  
  if (!termsAccepted) {
    return { error: "Please accept terms and conditions" };
  }
  
  // Get checkout data
  const session = await getSession(request.headers.get("Cookie"));
  const checkoutData = session.get(checkoutDataKey);
  
  // Get cart
  const cart = await getCart(request);
  
  // Create order
  const order = await createOrder({
    userId: user.id,
    items: cart.items,
    address: checkoutData.address,
    payment: checkoutData.payment,
  });
  
  // Clear cart and checkout data
  await clearCart(request);
  session.unset(checkoutDataKey);
  
  // Redirect to order confirmation
  return redirect(`/orders/${order.id}`);
}
```

## Order Management

### Creating Orders

**File:** `app/lib/orders.server.ts`

Orders are created with:
- User ID
- Cart items
- Shipping address
- Payment information
- Order status (default: "pending")
- Timestamps

### Order Status

Orders can have the following statuses:
- `pending` - Order placed, awaiting processing
- `processing` - Order is being prepared
- `shipped` - Order has been shipped
- `delivered` - Order has been delivered
- `cancelled` - Order was cancelled

### Viewing Orders

**Route:** `/orders`

**File:** `app/routes/(private)/orders/route.tsx`

Lists all orders for the current user.

**Route:** `/orders/:orderId`

**File:** `app/routes/(private)/orders/$orderId/route.tsx`

Shows detailed information for a specific order.

## Session Persistence

### Cart Persistence

Cart data persists:
- Across page reloads
- During navigation
- After login/logout (cart is preserved during logout)

### Checkout Data Persistence

Checkout data (address, payment) is stored in session and:
- Persists between checkout steps
- Is cleared after successful order placement
- Can be lost if session expires

## Best Practices

1. **Validate cart on checkout:** Ensure cart is not empty before allowing checkout
2. **Require authentication:** Checkout should require user login
3. **Validate checkout data:** Ensure all required fields are present before order placement
4. **Handle errors gracefully:** Show clear error messages for failed operations
5. **Optimistic updates:** Use React Router's `useFetcher` for smooth UX
6. **Clear sensitive data:** Remove payment info from session after order placement

## Example: Adding to Cart

```typescript
import { useFetcher } from "react-router";

export default function ProductInfo({ product }: Props) {
  const fetcher = useFetcher();
  
  const handleAddToCart = () => {
    fetcher.submit(
      {
        action: "add",
        productId: String(product.id),
        quantity: "1",
      },
      {
        method: "post",
        action: "/cart/actions",
      }
    );
  };
  
  return (
    <button onClick={handleAddToCart}>
      Add to Cart
    </button>
  );
}
```

## Example: Updating Cart Item

```typescript
<fetcher.Form method="post" action="/cart/actions">
  <input type="hidden" name="action" value="update" />
  <input type="hidden" name="productId" value={item.productId} />
  <input
    type="number"
    name="quantity"
    value={quantity}
    onChange={(e) => {
      fetcher.submit(
        {
          action: "update",
          productId: String(item.productId),
          quantity: e.target.value,
        },
        { method: "post", action: "/cart/actions" }
      );
    }}
  />
</fetcher.Form>
```

## Troubleshooting

### Cart Not Persisting

- Check session storage configuration
- Verify cookies are being set correctly
- Check browser console for errors

### Checkout Data Lost

- Ensure session is properly committed
- Check session expiration settings
- Verify checkout data is saved at each step

### Order Creation Fails

- Verify all required checkout data is present
- Check database connection
- Review order creation logic for errors

