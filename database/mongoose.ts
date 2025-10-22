import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV || "development";

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

// Connection options optimized for production
const connectionOptions: mongoose.ConnectOptions = {
  bufferCommands: false, // Disable buffering for better error handling
  maxPoolSize: 10, // Maximum number of sockets the MongoDB driver will keep open
  serverSelectionTimeoutMS: 5000, // Timeout for initial server selection
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
};

// Setup connection event listeners (only once)
let listenersSet = false;

const setupConnectionListeners = () => {
  if (listenersSet) return;

  mongoose.connection.on("connected", () => {
    console.log(`[MongoDB] Connected to database (${NODE_ENV})`);
  });

  mongoose.connection.on("error", (err) => {
    console.error("[MongoDB] Connection error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[MongoDB] Disconnected from database");
  });

  // Graceful shutdown
  const cleanup = async () => {
    try {
      await Promise.race([
        mongoose.connection.close(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Close timeout")), 1000),
        ),
      ]);

      console.log("[MongoDB] Connection closed through app termination");
      process.exit(0);
    } catch (err) {
      console.error("[MongoDB] Error during connection close:", err);
      process.exit(1);
    }
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  listenersSet = true;
};

export const connectToDatabase = async (): Promise<typeof mongoose> => {
  // Validate MONGODB_URI
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not defined. Please set it in your .env file",
    );
  }

  // Return cached connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Setup event listeners
  setupConnectionListeners();

  // Create connection promise if not exists
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, connectionOptions);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    // Clear failed promise to allow retry
    cached.promise = null;

    // Provide helpful error message
    const error = err as Error;
    console.error("[MongoDB] Failed to connect:", error.message);

    throw new Error(
      `Failed to connect to MongoDB: ${error.message}. Please check your MONGODB_URI and network connection.`,
    );
  }
};

// Helper function to check connection status
export const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

// Helper function to disconnect (useful for testing)
export const disconnectFromDatabase = async (): Promise<void> => {
  if (cached.conn) {
    await mongoose.connection.close();
    cached.conn = null;
    cached.promise = null;
  }
};
