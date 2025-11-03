"use client";

import { useState } from "react";
import { useDataStore } from "../context/DataStore";
import { Factory, Package, Clock, CheckCircle } from "lucide-react";
import "./Production.css";

function Production() {
  const { orders, updateProductionStatus } = useDataStore();
  const [activeTab, setActiveTab] = useState("pending");

  // กรองออเดอร์ตามสถานะการผลิต
  const productionOrders = {
    pending: orders.filter(
      (o) =>
        o.productionStatus === "รอเริ่มผลิต" &&
        o.paymentStatus !== "ยังไม่ได้ชำระเงิน" // เพิ่มเงื่อนไขนี้
    ),
    inProgress: orders.filter(
      (o) =>
        o.productionStatus === "กำลังผลิต" &&
        o.paymentStatus !== "ยังไม่ได้ชำระเงิน" // เพิ่มเงื่อนไขนี้
    ),
    packaging: orders.filter(
      (o) =>
        o.productionStatus === "บรรจุกระป๋อง" &&
        o.paymentStatus !== "ยังไม่ได้ชำระเงิน" // เพิ่มเงื่อนไขนี้
    ),
    ready: orders.filter(
      (o) =>
        o.productionStatus === "พร้อมจัดส่ง" &&
        o.deliveryStatus !== "จัดส่งแล้ว" &&
        o.status !== "เสร็จสิ้น" &&
        o.paymentStatus !== "ยังไม่ได้ชำระเงิน" // เพิ่มเงื่อนไขนี้
    ),
  };

  const stats = [
    {
      label: "รอเริ่มผลิต",
      value: productionOrders.pending.length,
      icon: Clock,
      color: "stat-warning",
    },
    {
      label: "กำลังผลิต",
      value: productionOrders.inProgress.length,
      icon: Factory,
      color: "stat-info",
    },
    {
      label: "บรรจุกระป๋อง",
      value: productionOrders.packaging.length,
      icon: Package,
      color: "stat-primary",
    },
    {
      label: "พร้อมจัดส่ง",
      value: productionOrders.ready.length,
      icon: CheckCircle,
      color: "stat-success",
    },
  ];

  const tabs = [
    { id: "pending", label: "รอเริ่มผลิต", orders: productionOrders.pending },
    {
      id: "inProgress",
      label: "กำลังผลิต",
      orders: productionOrders.inProgress,
    },
    {
      id: "packaging",
      label: "บรรจุกระป๋อง",
      orders: productionOrders.packaging,
    },
    { id: "ready", label: "พร้อมจัดส่ง", orders: productionOrders.ready },
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
          {tabs.find((t) => t.id === activeTab)?.orders.length === 0 ? (
            <div className="empty-state">
              <Package size={64} />
              <p>ไม่มีคำสั่งซื้อในสถานะนี้</p>
            </div>
          ) : (
            <div className="orders-grid">
              {tabs
                .find((t) => t.id === activeTab)
                ?.orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <h3 className="order-id">คำสั่งซื้อ #{order.id}</h3>
                      <span className="customer-name">
                        {order.customerName}
                      </span>
                    </div>

                    <div className="order-items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item">
                          <span>{item.productName}</span>
                          <span>x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="status-controls">
                      {(() => {
                        const current = order.productionStatus || FLOW[0];
                        const idx = FLOW.indexOf(current);
                        const prev = idx > 0 ? FLOW[idx - 1] : null;
                        const next =
                          idx < FLOW.length - 1 ? FLOW[idx + 1] : null;

                        // 🔹 เงื่อนไขห้ามย้อนกลับเมื่อถึง "บรรจุกระป๋อง"
                        const canGoBack = prev && current !== "บรรจุกระป๋อง";

                        const move = (target) => {
                          if (!target) return;
                          console.log(
                            `Updating production status for order ${order.id} to ${target}`
                          );
                          updateProductionStatus(order.id, target);
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
                                title={
                                  !canGoBack
                                    ? "ไม่สามารถย้อนกลับจากขั้นตอนบรรจุกระป๋องได้"
                                    : `ย้อนกลับ: ${prev}`
                                }
                              >
                                ← ย้อนกลับ
                              </button>

                              <button
                                type="button"
                                className="status-btn next"
                                onClick={() => move(next)}
                                disabled={!next}
                                title={
                                  next
                                    ? `ไปขั้นต่อไป: ${next}`
                                    : "ถึงขั้นสุดท้ายแล้ว"
                                }
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
          )}
        </div>
      </div>
    </div>
  );
}

export default Production;
