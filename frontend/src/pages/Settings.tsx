import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

type NotificationKey = "newOrder" | "lowStock" | "shippingDelay";

const NOTIFICATION_ITEMS: { key: NotificationKey; label: string; description: string }[] = [
  {
    key: "newOrder",
    label: "신규 주문 알림",
    description: "새 주문이 접수되면 알림을 받습니다.",
  },
  {
    key: "lowStock",
    label: "재고 부족 알림",
    description: "상품 재고가 10개 이하로 떨어지면 알림을 받습니다.",
  },
  {
    key: "shippingDelay",
    label: "배송 지연 알림",
    description: "배송이 예정보다 지연되면 알림을 받습니다.",
  },
];

function SettingRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export default function Settings() {
  const { admin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    newOrder: true,
    lowStock: true,
    shippingDelay: false,
  });

  function handleNotificationChange(key: NotificationKey, checked: boolean) {
    setNotifications((prev) => ({ ...prev, [key]: checked }));
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">설정</h1>
        <p className="text-sm text-muted-foreground">
          계정 정보와 화면, 알림 설정을 관리합니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>계정 정보</CardTitle>
          <CardDescription>현재 로그인한 관리자 계정입니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex justify-between border-b border-dashed border-border py-2 first:pt-0">
            <span className="text-muted-foreground">이름</span>
            <span className="font-medium">{admin?.name ?? "-"}</span>
          </div>
          <div className="flex justify-between border-b border-dashed border-border py-2">
            <span className="text-muted-foreground">이메일</span>
            <span className="font-mono">{admin?.email ?? "-"}</span>
          </div>
          <div className="flex justify-between py-2 last:pb-0">
            <span className="text-muted-foreground">역할</span>
            <span className="font-medium">관리자</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>화면 설정</CardTitle>
          <CardDescription>어드민 화면의 표시 방식을 설정합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingRow
            label="다크 모드"
            description="어두운 배경으로 화면을 표시합니다."
            checked={theme === "dark"}
            onCheckedChange={toggleTheme}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>알림 설정</CardTitle>
          <CardDescription>운영 중 받을 알림 항목을 선택합니다.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-dashed divide-border">
          {NOTIFICATION_ITEMS.map((item) => (
            <SettingRow
              key={item.key}
              label={item.label}
              description={item.description}
              checked={notifications[item.key]}
              onCheckedChange={(checked) => handleNotificationChange(item.key, checked)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
