"use client";

import { useState } from "react";
import { useDataStore } from "../context/DataStore";
import { Factory, Package, Clock, CheckCircle } from "lucide-react";
import "./Production.css";

function Production() {
  const { orders, updateProductionStatus, updateStock } = useDataStore();
  const [activeTab, setActiveTab] = useState("pending");

  // กรองออเดอร์ตามสถานะการผลิต
  const productionOrders = orders?.filter((o) => o.productionStatus === "รอเริ่มผลิต") || [];

  const stats = [
    {
      label: "รอเริ่มผลิต",
      value: productionOrders.length,
      icon: Clock,
      color: "stat-warning",
    },
    {
      label: "กำลังผลิต",
      value: orders.filter(
        (o) =>
          o.productionStatus === "กำลังผลิต" &&
          o.paymentStatus !== "ยังไม่ได้ชำระเงิน"
      ).length,
      icon: Factory,
      color: "stat-info",
    },
    {
      label: "บรรจุกระป๋อง",
      value: orders.filter(
        (o) =>
          o.productionStatus === "บรรจุกระป๋อง" &&
          o.paymentStatus !== "ยังไม่ได้ชำระเงิน"
      ).length,
      icon: Package,
      color: "stat-primary",
    },
    {
      label: "พร้อมจัดส่ง",
      value: orders.filter(
        (o) =>
          o.productionStatus === "พร้อมจัดส่ง" &&
          o.deliveryStatus !== "จัดส่งแล้ว" &&
          o.status !== "เสร็จสิ้น" &&
          o.paymentStatus !== "ยังไม่ได้ชำระเงิน"
      ).length,
      icon: CheckCircle,
      color: "stat-success",
    },
  ];

  const tabs = [
    { id: "pending", label: "รอเริ่มผลิต", orders: productionOrders },
    {
      id: "inProgress",
      label: "กำลังผลิต",
      orders: orders.filter(
        (o) =>
          o.productionStatus === "กำลังผลิต" &&
          o.paymentStatus !== "ยังไม่ได้ชำระเงิน"
      ),
    },
    {
      id: "packaging",
      label: "บรรจุกระป๋อง",
      orders: orders.filter(
        (o) =>
          o.productionStatus === "บรรจุกระป๋อง" &&
          o.paymentStatus !== "ยังไม่ได้ชำระเงิน"
      ),
    },
    {
      id: "ready",
      label: "พร้อมจัดส่ง",
      orders: orders.filter(
        (o) =>
          o.productionStatus === "พร้อมจัดส่ง" &&
          o.deliveryStatus !== "จัดส่งแล้ว" &&
          o.status !== "เสร็จสิ้น" &&
          o.paymentStatus !== "ยังไม่ได้ชำระเงิน"
      ),
    },
  ];

  const FLOW = ["รอเริ่มผลิต", "กำลังผลิต", "บรรจุกระป๋อง", "พร้อมจัดส่ง"];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">การผลิต</h1>
          <p className="page-subtitle">ติดตามและจัดการสถานะการผลิต</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`stat-card ${stat.color}`}>
              <Icon size={24} />
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="tabs-container">
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab ${activeTab === tab.id ? "tab-active" : ""}`}
            >
              {tab.label}
              <span className="tab-badge">{tab.orders.length}</span>
            </button>
          ))}
        </div>

        <div className="tab-content">
          {(() => {
            const currentTab = tabs.find((t) => t.id === activeTab);
            const currentOrders = currentTab?.orders ?? [];

            if (currentOrders.length === 0) {
              return (
                <div className="empty-state">
                  <Package size={64} />
                  <p>ไม่มีคำสั่งซื้อในสถานะนี้</p>
                </div>
              );
            }

            return (
              <div className="orders-grid">
                {currentOrders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <h3 className="order-id">คำสั่งซื้อ #{order.id}</h3>
                      <span className="customer-name">{order.customerName}</span>
                    </div>

                    <div className="order-items">
                      {(order.items ?? []).map((item, idx) => (
                        <div key={idx} className="order-item">
                          <span>{item.productName}</span>
                          <span>x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* ✅ ส่วนนี้คือปุ่มควบคุมสถานะ */}
                    <div className="status-controls">
                      {(() => {
                        const current = order.productionStatus || FLOW[0];
                        const idx = FLOW.indexOf(current);
                        const prev = idx > 0 ? FLOW[idx - 1] : null;
                        const next = idx >= 0 && idx < FLOW.length - 1 ? FLOW[idx + 1] : null;

                        const canGoBack = prev && current !== "บรรจุกระป๋อง";

                        const move = (target) => {
                          if (!target) return;
                          updateProductionStatus(order.id, target);
                          if (target === "พร้อมจัดส่ง" && order.productionStatus === "บรรจุกระป๋อง") {
                            const itemsToUpdate = (order.items ?? []).map((item) => ({
                              productId: item.productId,
                              quantity: item.quantity,
                            }));
                            updateStock(itemsToUpdate);
                          }
                        };

                        return (
                          <>
                            <span className="current-status">
                              สถานะปัจจุบัน: <b>{current}</b>
                            </span>

                            <div className="status-actions">
                              <button
                                type="button"
                                className="status-btn back"
                                onClick={() => move(prev)}
                                disabled={!canGoBack}
                              >
                                ← ย้อนกลับ
                              </button>

                              <button
                                type="button"
                                className="status-btn next"
                                onClick={() => move(next)}
                                disabled={!next}
                              >
                                ไปขั้นต่อไป →
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default Production;
