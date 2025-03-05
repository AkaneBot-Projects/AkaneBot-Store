import axios from 'axios';

class TopupInyukAPI {
    /**
     * Constructor for TopupInyuk API Wrapper
     * @param {string} apiKey - Your TopupInyuk API key
     * @param {Object} [options] - Optional configuration
     */
    constructor(apiKey, options = {}) {
        // Base URL for TopupInyuk API
        this.baseURL = options.baseURL || 'https://api.topupinyuk.id';
        
        // Validate API Key
        if (!apiKey) {
            throw new Error('API Key is required');
        }
        this.apiKey = apiKey;

        // Create axios instance with base configuration
        this.axiosInstance = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Get available services
     * @returns {Promise} Promise resolving to services data
     */
    async getServices() {
        try {
            const response = await this.axiosInstance.post('/service', {
                api_key: this.apiKey
            });
            return response.data;
        } catch (error) {
            this._handleError(error);
        }
    }

    /**
     * Place an order
     * @param {Object} orderDetails - Order parameters
     * @param {string} orderDetails.service_id - Service ID
     * @param {string} orderDetails.target - Target ID (with zone if applicable)
     * @param {string} orderDetails.kontak - Contact number
     * @param {string} orderDetails.idtrx - Unique transaction ID
     * @param {string} [orderDetails.callback] - Optional callback URL
     * @returns {Promise} Promise resolving to order details
     */
    async createOrder(orderDetails) {
        // Validate required fields
        const requiredFields = ['service_id', 'target', 'kontak', 'idtrx'];
        requiredFields.forEach(field => {
            if (!orderDetails[field]) {
                throw new Error(`${field} is required for creating an order`);
            }
        });

        try {
            const payload = {
                api_key: this.apiKey,
                ...orderDetails
            };

            const response = await this.axiosInstance.post('/order', payload);
            return response.data;
        } catch (error) {
            this._handleError(error);
        }
    }

    /**
     * Check order status
     * @param {string} orderId - TopupInyuk invoice/order ID
     * @returns {Promise} Promise resolving to order status
     */
    async checkOrderStatus(orderId) {
        if (!orderId) {
            throw new Error('Order ID is required');
        }

        try {
            const response = await this.axiosInstance.post('/status', {
                api_key: this.apiKey,
                order_id: orderId
            });
            return response.data;
        } catch (error) {
            this._handleError(error);
        }
    }

    /**
     * Check account balance
     * @returns {Promise} Promise resolving to account balance
     */
    async checkBalance() {
        try {
            const response = await this.axiosInstance.post('/saldo', {
                api_key: this.apiKey
            });
            return response.data;
        } catch (error) {
            this._handleError(error);
        }
    }

    /**
     * Internal error handler
     * @param {Error} error - Axios error object
     * @private
     */
    _handleError(error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            throw new Error(`API Error: ${error.response.data.msg || 'Unknown error'}`);
        } else if (error.request) {
            // The request was made but no response was received
            throw new Error('No response received from TopupInyuk API');
        } else {
            // Something happened in setting up the request
            throw new Error(`Request Error: ${error.message}`);
        }
    }
}

export default TopupInyukAPI;

/*
async function exampleUsage() {
    try {
        // Initialize the API wrapper
        const topupinyuk = new TopupInyukAPI('YOUR_API_KEY');

        // Get available services
        const services = await topupinyuk.getServices();
        console.log('Available Services:', services);

        // Check balance
        const balance = await topupinyuk.checkBalance();
        console.log('Current Balance:', balance);

        // Create an order (example)
        const orderDetails = {
            service_id: 'ML86',
            target: '983232342|9923',
            kontak: '08151769999',
            idtrx: `ORDER${Date.now()}`
        };
        const orderResponse = await topupinyuk.createOrder(orderDetails);
        console.log('Order Created:', orderResponse);

        // Check order status
        const statusResponse = await topupinyuk.checkOrderStatus(orderResponse.data.id);
        console.log('Order Status:', statusResponse);

    } catch (error) {
        console.error('Error:', error.message);
    }
}
*/