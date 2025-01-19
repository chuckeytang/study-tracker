import { apiRequest } from "@/utils/api";
const fetchUserDetails = async (token: string) => {
  try {
    const userDetails = await apiRequest(
      "/api/users/getMe",
      "GET",
      null,
      false
    );
    localStorage.setItem("user", JSON.stringify(userDetails));
    return userDetails;
  } catch (error) {
    console.error("Failed to fetch user details:", error);
  }
};

class WebUser {
  private static instance: WebUser | null = null;
  private userData: any = null; // 存储用户数据
  private expired: boolean = false; // 过期标记
  private readonly userKey: string = "user";
  private animationKey: string;

  private constructor() {
    this.animationKey = "giftAnimationPlayed";
    this.loadUserFromStorage();
  }

  // 单例模式获取 WebUser 实例
  public static getInstance(): WebUser {
    if (!WebUser.instance) {
      WebUser.instance = new WebUser();
    }
    return WebUser.instance;
  }

  // 从 localStorage 加载用户数据
  private loadUserFromStorage() {
    const storedUser = localStorage.getItem(this.userKey);
    if (storedUser) {
      this.userData = JSON.parse(storedUser);
    } else {
      console.error("Failed to fetch user details from localstorage");
    }
  }

  // 获取用户数据，如果过期则重新获取
  public async getUserData(): Promise<any> {
    if (!this.userData || this.expired) {
      await this.fetchUserData();
    }
    return this.userData;
  }

  // 标记用户数据为过期
  public markAsExpired() {
    this.expired = true;
  }

  // 从服务器获取最新用户数据
  private async fetchUserData() {
    try {
      const userDetails = await apiRequest(
        "/api/users/getMe",
        "GET",
        null,
        false
      );
      localStorage.setItem(this.userKey, JSON.stringify(userDetails));

      this.userData = userDetails;
      this.expired = false; // 重置过期标记
      return userDetails;
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    }
  }

  public hasPlayedGiftAnimation(userId: string): boolean {
    const key = `${this.animationKey}_${userId}`;
    return localStorage.getItem(key) === "true";
  }

  public setGiftAnimationPlayed(userId: string) {
    const key = `${this.animationKey}_${userId}`;
    localStorage.setItem(key, "true");
  }
}

export default WebUser;
