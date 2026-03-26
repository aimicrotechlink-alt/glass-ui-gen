const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const stripeStr = require('stripe');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Check for Stripe key
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (stripeKey) {
    console.log("✅ Stripe Secret Key loaded successfully.");
} else {
    console.log("⚠️ Stripe Secret Key MISSING. Server running in MOCK mode.");
}
const stripe = stripeKey ? stripeStr(stripeKey) : null;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Create Checkout Session
app.post('/api/checkout', async (req, res) => {
    try {
        if (!stripe) {
            console.log("Stripe key missing. Simulating successful checkout.");
            return res.json({ url: '/index.html?session_id=mock_session_123&success=true' });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'GlassUI Pro Lifetime',
                            description: 'Unlock React, Vue, Tailwind exports and premium templates.',
                        },
                        unit_amount: 2900, // $29.00
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.protocol}://${req.get('host')}/index.html?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: `${req.protocol}://${req.get('host')}/index.html?canceled=true`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Stripe error:", error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running accurately at http://localhost:${port}`);
});
